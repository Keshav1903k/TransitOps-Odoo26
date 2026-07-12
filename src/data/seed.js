import { daysFromNow } from "../theme";

/* ------------------------------------------------------------------ */
/* Seed data                                                          */
/* ------------------------------------------------------------------ */
export const seedVehicles = () => ([
  { id: "V1", registrationNumber: "DL-01-VAN-05", name: "Van-05", type: "Van", maxLoadCapacity: 500, odometer: 12450, acquisitionCost: 850000, status: "AVAILABLE", region: "North" },
  { id: "V2", registrationNumber: "DL-02-TRK-12", name: "Truck-12", type: "Truck", maxLoadCapacity: 2000, odometer: 45210, acquisitionCost: 1800000, status: "AVAILABLE", region: "South" },
  { id: "V3", registrationNumber: "DL-03-BIK-02", name: "Bike-02", type: "Bike", maxLoadCapacity: 50, odometer: 8020, acquisitionCost: 120000, status: "AVAILABLE", region: "East" },
  { id: "V4", registrationNumber: "DL-04-VAN-09", name: "Van-09", type: "Van", maxLoadCapacity: 500, odometer: 30110, acquisitionCost: 900000, status: "IN_SHOP", region: "South" },
  { id: "V5", registrationNumber: "DL-05-TRK-03", name: "Truck-03", type: "Truck", maxLoadCapacity: 2200, odometer: 61200, acquisitionCost: 1950000, status: "RETIRED", region: "West" },
  { id: "V6", registrationNumber: "DL-06-TRK-07", name: "Truck-07", type: "Truck", maxLoadCapacity: 2500, odometer: 55000, acquisitionCost: 2100000, status: "ON_TRIP", region: "North" },
]);

export const seedDrivers = () => ([
  { id: "D1", name: "Alex Menon", licenseNumber: "DL-LIC-8841", licenseCategory: "LMV", licenseExpiryDate: daysFromNow(280), contactNumber: "98xxxxxxx1", safetyScore: 92, status: "AVAILABLE" },
  { id: "D2", name: "Priya Nair", licenseNumber: "DL-LIC-2210", licenseCategory: "HMV", licenseExpiryDate: daysFromNow(190), contactNumber: "98xxxxxxx2", safetyScore: 88, status: "AVAILABLE" },
  { id: "D3", name: "Ravi Kumar", licenseNumber: "DL-LIC-5567", licenseCategory: "HMV", licenseExpiryDate: daysFromNow(-40), contactNumber: "98xxxxxxx3", safetyScore: 74, status: "OFF_DUTY" },
  { id: "D4", name: "Sana Illias", licenseNumber: "DL-LIC-9034", licenseCategory: "LMV", licenseExpiryDate: daysFromNow(400), contactNumber: "98xxxxxxx4", safetyScore: 65, status: "SUSPENDED" },
  { id: "D5", name: "Karan Verma", licenseNumber: "DL-LIC-1180", licenseCategory: "HMV", licenseExpiryDate: daysFromNow(320), contactNumber: "98xxxxxxx5", safetyScore: 95, status: "ON_TRIP" },
]);

export const seedTrips = () => ([
  { id: "T1", source: "Delhi Hub", destination: "Gurugram DC", vehicleId: "V1", driverId: "D1", cargoWeight: 450, plannedDistance: 32, actualDistance: null, fuelConsumed: null, revenue: 4200, status: "DRAFT", dispatchedAt: null, completedAt: null, createdAt: daysFromNow(-1) },
  { id: "T2", source: "Noida Hub", destination: "Faridabad DC", vehicleId: "V6", driverId: "D5", cargoWeight: 1800, plannedDistance: 40, actualDistance: null, fuelConsumed: null, revenue: 6800, status: "DISPATCHED", dispatchedAt: daysFromNow(-1), completedAt: null, createdAt: daysFromNow(-2) },
  { id: "T3", source: "Delhi Hub", destination: "Sonipat DC", vehicleId: "V1", driverId: "D2", cargoWeight: 380, plannedDistance: 28, actualDistance: 29.5, fuelConsumed: 6.4, revenue: 3900, status: "COMPLETED", dispatchedAt: daysFromNow(-6), completedAt: daysFromNow(-5), createdAt: daysFromNow(-7) },
  { id: "T4", source: "Gurugram Hub", destination: "Manesar DC", vehicleId: "V2", driverId: "D2", cargoWeight: 1500, plannedDistance: 22, actualDistance: 23.1, fuelConsumed: 9.8, revenue: 5100, status: "COMPLETED", dispatchedAt: daysFromNow(-10), completedAt: daysFromNow(-9), createdAt: daysFromNow(-11) },
]);

export const seedMaintenance = () => ([
  { id: "M1", vehicleId: "V4", description: "Brake pad replacement", cost: 4200, status: "OPEN", createdAt: daysFromNow(-2), closedAt: null },
  { id: "M2", vehicleId: "V2", description: "Oil change", cost: 1200, status: "CLOSED", createdAt: daysFromNow(-15), closedAt: daysFromNow(-14) },
]);

export const seedFuel = () => ([
  { id: "F1", vehicleId: "V1", liters: 6.4, cost: 640, date: daysFromNow(-5) },
  { id: "F2", vehicleId: "V2", liters: 9.8, cost: 980, date: daysFromNow(-9) },
  { id: "F3", vehicleId: "V6", liters: 12.1, cost: 1210, date: daysFromNow(-1) },
]);

export const seedExpense = () => ([
  { id: "E1", vehicleId: "V1", type: "Toll", amount: 180, date: daysFromNow(-5) },
  { id: "E2", vehicleId: "V6", type: "Toll", amount: 240, date: daysFromNow(-1) },
  { id: "E3", vehicleId: "V2", type: "Misc", amount: 350, date: daysFromNow(-9) },
]);
