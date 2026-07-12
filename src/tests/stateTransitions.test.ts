import { prisma } from '../lib/db';
import {
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  createMaintenanceLog,
  closeMaintenanceLog,
} from '../actions/stateTransitions';

async function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runTests() {
  console.log('--- Starting State Transition Unit Tests ---');
  let passed = 0;
  let failed = 0;

  async function testCase(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // Setup test assets
  const vehicle = await prisma.vehicle.create({
    data: {
      registrationNumber: 'TEST-V-1',
      name: 'Test Truck',
      type: 'Truck',
      maxLoadCapacity: 10000,
      odometer: 1000,
      acquisitionCost: 50000,
      status: 'AVAILABLE',
      region: 'TestRegion',
    },
  });

  const expiredDriver = await prisma.driver.create({
    data: {
      name: 'Expired Driver',
      licenseNumber: 'TEST-LIC-EXP',
      licenseCategory: 'Class A',
      licenseExpiryDate: new Date('2020-01-01'), // Expired
      contactNumber: '123',
      safetyScore: 90,
      status: 'AVAILABLE',
    },
  });

  const suspendedDriver = await prisma.driver.create({
    data: {
      name: 'Suspended Driver',
      licenseNumber: 'TEST-LIC-SUSP',
      licenseCategory: 'Class A',
      licenseExpiryDate: new Date('2030-01-01'),
      contactNumber: '123',
      safetyScore: 90,
      status: 'SUSPENDED',
    },
  });

  const validDriver = await prisma.driver.create({
    data: {
      name: 'Valid Driver',
      licenseNumber: 'TEST-LIC-VAL',
      licenseCategory: 'Class A',
      licenseExpiryDate: new Date('2030-01-01'),
      contactNumber: '123',
      safetyScore: 90,
      status: 'AVAILABLE',
    },
  });

  // Test 1: Create Draft Trip
  await testCase('Create Trip Draft', async () => {
    const trip = await createTrip({
      source: 'A',
      destination: 'B',
      vehicleId: vehicle.id,
      driverId: validDriver.id,
      cargoWeight: 5000,
      plannedDistance: 100,
      revenue: 500,
    });
    await assert(trip.status === 'DRAFT', 'Trip status should be DRAFT');
    // clean up trip
    await prisma.trip.delete({ where: { id: trip.id } });
  });

  // Test 2: Dispatch Guard - Expired License
  await testCase('Dispatch Guard: Expired License', async () => {
    const trip = await createTrip({
      source: 'A',
      destination: 'B',
      vehicleId: vehicle.id,
      driverId: expiredDriver.id,
      cargoWeight: 5000,
      plannedDistance: 100,
      revenue: 500,
    });

    let threw = false;
    try {
      await dispatchTrip(trip.id);
    } catch (e: any) {
      threw = true;
      await assert(e.message.includes('expired'), `Expected expired license error, got: ${e.message}`);
    }
    await assert(threw, 'Should throw an error for expired license');
    await prisma.trip.delete({ where: { id: trip.id } });
  });

  // Test 3: Dispatch Guard - Cargo Overweight
  await testCase('Dispatch Guard: Cargo Overweight', async () => {
    const trip = await createTrip({
      source: 'A',
      destination: 'B',
      vehicleId: vehicle.id,
      driverId: validDriver.id,
      cargoWeight: 15000, // exceeds 10000 limit
      plannedDistance: 100,
      revenue: 500,
    });

    let threw = false;
    try {
      await dispatchTrip(trip.id);
    } catch (e: any) {
      threw = true;
      await assert(e.message.includes('exceeds'), `Expected cargo overweight error, got: ${e.message}`);
    }
    await assert(threw, 'Should throw an error for cargo overweight');
    await prisma.trip.delete({ where: { id: trip.id } });
  });

  // Test 4: Dispatch & Complete Trip Success Flow
  await testCase('Dispatch & Complete Success Flow', async () => {
    const trip = await createTrip({
      source: 'A',
      destination: 'B',
      vehicleId: vehicle.id,
      driverId: validDriver.id,
      cargoWeight: 5000,
      plannedDistance: 100,
      revenue: 500,
    });

    // Dispatch
    await dispatchTrip(trip.id);
    
    // Check statuses changed to ON_TRIP
    const dbTrip = await prisma.trip.findUnique({ where: { id: trip.id } });
    const dbVehicle = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    const dbDriver = await prisma.driver.findUnique({ where: { id: validDriver.id } });

    await assert(dbTrip?.status === 'DISPATCHED', 'Trip status should be DISPATCHED');
    await assert(dbVehicle?.status === 'ON_TRIP', 'Vehicle status should be ON_TRIP');
    await assert(dbDriver?.status === 'ON_TRIP', 'Driver status should be ON_TRIP');

    // Complete
    await completeTrip(trip.id, 120, 15);

    const completedTrip = await prisma.trip.findUnique({ where: { id: trip.id } });
    const freeVehicle = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    const freeDriver = await prisma.driver.findUnique({ where: { id: validDriver.id } });

    await assert(completedTrip?.status === 'COMPLETED', 'Trip status should be COMPLETED');
    await assert(freeVehicle?.status === 'AVAILABLE', 'Vehicle should return to AVAILABLE');
    await assert(freeDriver?.status === 'AVAILABLE', 'Driver should return to AVAILABLE');
    await assert(freeVehicle?.odometer === 1120, `Odometer should increment by 120 (current: ${freeVehicle?.odometer})`);

    // Clean up
    await prisma.trip.delete({ where: { id: trip.id } });
  });

  // Test 5: Cancel Dispatched Trip
  await testCase('Cancel Dispatched Trip', async () => {
    // Reset vehicle and driver statuses to AVAILABLE
    await prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: 'AVAILABLE' } });
    await prisma.driver.update({ where: { id: validDriver.id }, data: { status: 'AVAILABLE' } });

    const trip = await createTrip({
      source: 'A',
      destination: 'B',
      vehicleId: vehicle.id,
      driverId: validDriver.id,
      cargoWeight: 5000,
      plannedDistance: 100,
      revenue: 500,
    });

    await dispatchTrip(trip.id);
    await cancelTrip(trip.id);

    const cancelledTrip = await prisma.trip.findUnique({ where: { id: trip.id } });
    const freeVehicle = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    const freeDriver = await prisma.driver.findUnique({ where: { id: validDriver.id } });

    await assert(cancelledTrip?.status === 'CANCELLED', 'Trip status should be CANCELLED');
    await assert(freeVehicle?.status === 'AVAILABLE', 'Vehicle should return to AVAILABLE');
    await assert(freeDriver?.status === 'AVAILABLE', 'Driver should return to AVAILABLE');

    await prisma.trip.delete({ where: { id: trip.id } });
  });

  // Test 6: Maintenance logs rules
  await testCase('Maintenance logs (Open, Close, Retired checks)', async () => {
    // Reset vehicle to AVAILABLE
    await prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: 'AVAILABLE' } });

    // Open maintenance
    const log = await createMaintenanceLog(vehicle.id, 'Oil Change', 150);
    const inShopVehicle = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    await assert(inShopVehicle?.status === 'IN_SHOP', 'Vehicle should be IN_SHOP');

    // Close maintenance
    await closeMaintenanceLog(log.id);
    const availableVehicle = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    await assert(availableVehicle?.status === 'AVAILABLE', 'Vehicle should return to AVAILABLE');

    // Test retired vehicle override
    const log2 = await createMaintenanceLog(vehicle.id, 'Tire rotation', 100);
    
    // Manually retire vehicle while in shop
    await prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: 'RETIRED' } });

    // Close maintenance log
    await closeMaintenanceLog(log2.id);
    const retiredVehicle = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    await assert(retiredVehicle?.status === 'RETIRED', 'Vehicle status should remain RETIRED even after log closure');

    // Clean up logs
    await prisma.maintenanceLog.deleteMany({ where: { vehicleId: vehicle.id } });
  });

  // Clean up assets
  await prisma.driver.delete({ where: { id: expiredDriver.id } });
  await prisma.driver.delete({ where: { id: suspendedDriver.id } });
  await prisma.driver.delete({ where: { id: validDriver.id } });
  await prisma.vehicle.delete({ where: { id: vehicle.id } });

  console.log(`\n--- Test Summary: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
