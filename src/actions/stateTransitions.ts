'use server';

import { prisma } from '@/lib/db';

/**
 * 1. Create Trip (updates status -> DRAFT)
 * This is implemented as a standard Prisma write, but wrapped in a helper.
 */
export async function createTrip(data: {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
  revenue: number;
}) {
  if (data.cargoWeight <= 0) {
    throw new Error('Cargo weight must be greater than 0.');
  }
  if (data.plannedDistance <= 0) {
    throw new Error('Planned distance must be greater than 0.');
  }
  if (data.revenue < 0) {
    throw new Error('Revenue cannot be negative.');
  }

  return await prisma.trip.create({
    data: {
      source: data.source,
      destination: data.destination,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      cargoWeight: data.cargoWeight,
      plannedDistance: data.plannedDistance,
      revenue: data.revenue,
      status: 'DRAFT',
    },
  });
}

/**
 * 2. Dispatch Trip
 * Atomically validates guards and transitions Trip, Vehicle, and Driver statuses.
 */
export async function dispatchTrip(tripId: string) {
  return await prisma.$transaction(async (tx) => {
    // Fetch trip with related vehicle and driver details
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });

    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found.`);
    }

    if (trip.status !== 'DRAFT') {
      throw new Error(`Only DRAFT trips can be dispatched. Current status: ${trip.status}`);
    }

    const { vehicle, driver } = trip;

    // Guard rules check
    if (vehicle.status !== 'AVAILABLE') {
      throw new Error(`Vehicle ${vehicle.registrationNumber} is not AVAILABLE. Current status: ${vehicle.status}`);
    }

    if (driver.status === 'SUSPENDED') {
      throw new Error(`Driver ${driver.name} is currently SUSPENDED.`);
    }

    if (driver.status !== 'AVAILABLE') {
      throw new Error(`Driver ${driver.name} is not AVAILABLE. Current status: ${driver.status}`);
    }

    // License expiry date comparison (expiry must be >= today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(driver.licenseExpiryDate);
    if (expiry < today) {
      throw new Error(`Driver ${driver.name}'s license is expired (Expiry: ${expiry.toLocaleDateString()}).`);
    }

    // Cargo capacity check
    if (trip.cargoWeight > vehicle.maxLoadCapacity) {
      throw new Error(`Cargo weight (${trip.cargoWeight} kg) exceeds vehicle max capacity (${vehicle.maxLoadCapacity} kg).`);
    }

    // Perform updates atomically
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: 'DISPATCHED',
        dispatchedAt: new Date(),
      },
    });

    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: { status: 'ON_TRIP' },
    });

    await tx.driver.update({
      where: { id: driver.id },
      data: { status: 'ON_TRIP' },
    });

    return updatedTrip;
  });
}

/**
 * 3. Complete Trip
 * Transitions Trip to COMPLETED, updates vehicle odometer, releases vehicle and driver.
 */
export async function completeTrip(tripId: string, actualDistance: number, fuelConsumed: number) {
  if (actualDistance <= 0) {
    throw new Error('Actual distance must be greater than 0.');
  }
  if (fuelConsumed <= 0) {
    throw new Error('Fuel consumed must be greater than 0.');
  }

  return await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found.`);
    }

    if (trip.status !== 'DISPATCHED') {
      throw new Error(`Only DISPATCHED trips can be completed. Current status: ${trip.status}`);
    }

    // Update trip details
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: 'COMPLETED',
        actualDistance,
        fuelConsumed,
        completedAt: new Date(),
      },
    });

    // Update vehicle (status AVAILABLE, increment odometer)
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: {
        status: 'AVAILABLE',
        odometer: { increment: actualDistance },
      },
    });

    // Update driver (status AVAILABLE)
    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: 'AVAILABLE' },
    });

    return updatedTrip;
  });
}

/**
 * 4 & 5. Cancel Trip
 * If DISPATCHED: releases vehicle and driver to AVAILABLE.
 * If DRAFT: simply cancels.
 */
export async function cancelTrip(tripId: string) {
  return await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found.`);
    }

    if (trip.status !== 'DRAFT' && trip.status !== 'DISPATCHED') {
      throw new Error(`Only DRAFT or DISPATCHED trips can be cancelled. Current status: ${trip.status}`);
    }

    const previousStatus = trip.status;

    // Update trip status to CANCELLED
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: { status: 'CANCELLED' },
    });

    // If it was already dispatched, release assets
    if (previousStatus === 'DISPATCHED') {
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'AVAILABLE' },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' },
      });
    }

    return updatedTrip;
  });
}

/**
 * 6. Create Maintenance Log
 * Blocked if vehicle is currently ON_TRIP. Otherwise opens maintenance log and puts vehicle IN_SHOP.
 */
export async function createMaintenanceLog(vehicleId: string, description: string, cost: number) {
  if (cost < 0) {
    throw new Error('Maintenance cost cannot be negative.');
  }

  return await prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new Error(`Vehicle with ID ${vehicleId} not found.`);
    }

    // Reject if vehicle is on a trip
    if (vehicle.status === 'ON_TRIP') {
      throw new Error(`Vehicle ${vehicle.registrationNumber} is currently ON_TRIP and cannot be sent to maintenance.`);
    }

    // Create the log
    const log = await tx.maintenanceLog.create({
      data: {
        vehicleId,
        description,
        cost,
        status: 'OPEN',
      },
    });

    // Put vehicle IN_SHOP
    await tx.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'IN_SHOP' },
    });

    return log;
  });
}

/**
 * 7. Close Maintenance Log
 * Closes the log, puts vehicle to AVAILABLE, unless status is RETIRED.
 */
export async function closeMaintenanceLog(maintenanceLogId: string) {
  return await prisma.$transaction(async (tx) => {
    const log = await tx.maintenanceLog.findUnique({
      where: { id: maintenanceLogId },
      include: { vehicle: true },
    });

    if (!log) {
      throw new Error(`Maintenance log with ID ${maintenanceLogId} not found.`);
    }

    if (log.status !== 'OPEN') {
      throw new Error(`Only OPEN maintenance logs can be closed. Current status: ${log.status}`);
    }

    // Close log
    const updatedLog = await tx.maintenanceLog.update({
      where: { id: maintenanceLogId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    // Set vehicle status to AVAILABLE unless it was set to RETIRED in the meantime
    if (log.vehicle.status !== 'RETIRED') {
      await tx.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    }

    return updatedLog;
  });
}
