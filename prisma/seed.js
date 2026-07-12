const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash password
  const passwordHash = bcrypt.hashSync('password123', 10);

  // 3. Create Users representing the 4 Roles
  const users = [
    {
      name: 'Alice Manager',
      email: 'manager@transitops.com',
      passwordHash,
      role: 'FLEET_MANAGER',
    },
    {
      name: 'Bob Operator',
      email: 'driverops@transitops.com',
      passwordHash,
      role: 'DRIVER_OPS',
    },
    {
      name: 'Charlie Safety',
      email: 'safety@transitops.com',
      passwordHash,
      role: 'SAFETY_OFFICER',
    },
    {
      name: 'Diana Analyst',
      email: 'finance@transitops.com',
      passwordHash,
      role: 'FINANCIAL_ANALYST',
    },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }
  console.log('Seeded users.');

  // 4. Create Vehicles
  const vehicles = [
    {
      registrationNumber: 'TX-1001',
      name: 'Ford Transit Van',
      type: 'Van',
      maxLoadCapacity: 1500,
      odometer: 12000,
      acquisitionCost: 35000,
      status: 'AVAILABLE',
      region: 'North',
    },
    {
      registrationNumber: 'TX-1002',
      name: 'Volvo FH16 Semi-Truck',
      type: 'Truck',
      maxLoadCapacity: 18000,
      odometer: 85000,
      acquisitionCost: 110000,
      status: 'AVAILABLE',
      region: 'South',
    },
    {
      registrationNumber: 'TX-1003',
      name: 'Yamaha E-Bike',
      type: 'Bike',
      maxLoadCapacity: 50,
      odometer: 1500,
      acquisitionCost: 3000,
      status: 'IN_SHOP',
      region: 'East',
    },
    {
      registrationNumber: 'TX-1004',
      name: 'Mercedes-Benz Sprinter Cargo',
      type: 'Van',
      maxLoadCapacity: 2200,
      odometer: 45000,
      acquisitionCost: 48000,
      status: 'AVAILABLE',
      region: 'West',
    },
    {
      registrationNumber: 'TX-1005',
      name: 'Scania R500 Heavy Truck',
      type: 'Truck',
      maxLoadCapacity: 25000,
      odometer: 150000,
      acquisitionCost: 135000,
      status: 'RETIRED',
      region: 'North',
    },
  ];

  const seededVehicles = [];
  for (const v of vehicles) {
    const vDb = await prisma.vehicle.create({ data: v });
    seededVehicles.push(vDb);
  }
  console.log('Seeded vehicles.');

  // 5. Create Drivers
  const drivers = [
    {
      name: 'John Doe',
      licenseNumber: 'DL-90812',
      licenseCategory: 'Class A CDL',
      licenseExpiryDate: new Date('2027-10-15'),
      contactNumber: '+1 555-0192',
      safetyScore: 88,
      status: 'AVAILABLE',
    },
    {
      name: 'Jane Smith (Expired License)',
      licenseNumber: 'DL-45239',
      licenseCategory: 'Class B CDL',
      licenseExpiryDate: new Date('2024-05-12'), // Expired!
      contactNumber: '+1 555-0293',
      safetyScore: 92,
      status: 'AVAILABLE',
    },
    {
      name: 'Mike Miller',
      licenseNumber: 'DL-11883',
      licenseCategory: 'Class C Standard',
      licenseExpiryDate: new Date('2028-02-28'),
      contactNumber: '+1 555-0304',
      safetyScore: 95,
      status: 'AVAILABLE',
    },
    {
      name: 'Bob Brown (Suspended)',
      licenseNumber: 'DL-88374',
      licenseCategory: 'Class A CDL',
      licenseExpiryDate: new Date('2026-12-01'),
      contactNumber: '+1 555-0415',
      safetyScore: 42, // Low safety score
      status: 'SUSPENDED', // Suspended!
    },
    {
      name: 'Sarah Connor',
      licenseNumber: 'DL-55243',
      licenseCategory: 'Class B CDL',
      licenseExpiryDate: new Date('2027-01-20'),
      contactNumber: '+1 555-0526',
      safetyScore: 68, // Alert safety score
      status: 'AVAILABLE',
    },
  ];

  const seededDrivers = [];
  for (const d of drivers) {
    const dDb = await prisma.driver.create({ data: d });
    seededDrivers.push(dDb);
  }
  console.log('Seeded drivers.');

  // 6. Create Trips
  const v1 = seededVehicles[0]; // Ford Transit
  const v2 = seededVehicles[1]; // Volvo Truck
  const v4 = seededVehicles[3]; // Mercedes Sprinter

  const d1 = seededDrivers[0]; // John Doe
  const d3 = seededDrivers[2]; // Mike Miller
  const d5 = seededDrivers[4]; // Sarah Connor

  const trips = [
    {
      source: 'Chicago Warehouse A',
      destination: 'Detroit Depot B',
      vehicleId: v1.id,
      driverId: d1.id,
      cargoWeight: 1200,
      plannedDistance: 450,
      revenue: 850,
      status: 'DRAFT',
    },
    {
      source: 'Houston Distribution Hub',
      destination: 'Dallas Logistics Center',
      vehicleId: v2.id,
      driverId: d3.id,
      cargoWeight: 14000,
      plannedDistance: 380,
      revenue: 2100,
      status: 'DRAFT',
    },
    {
      source: 'Miami Port Terminal',
      destination: 'Orlando Retail Plaza',
      vehicleId: v4.id,
      driverId: d5.id,
      cargoWeight: 1800,
      plannedDistance: 370,
      actualDistance: 375,
      fuelConsumed: 45,
      revenue: 1200,
      status: 'COMPLETED',
      dispatchedAt: new Date('2026-07-01T08:00:00Z'),
      completedAt: new Date('2026-07-01T14:30:00Z'),
      createdAt: new Date('2026-06-30T10:00:00Z'),
    },
    {
      source: 'Los Angeles Yard',
      destination: 'Phoenix Distribution',
      vehicleId: v2.id,
      driverId: d1.id,
      cargoWeight: 16000,
      plannedDistance: 590,
      actualDistance: 592,
      fuelConsumed: 185,
      revenue: 3400,
      status: 'COMPLETED',
      dispatchedAt: new Date('2026-07-05T06:00:00Z'),
      completedAt: new Date('2026-07-05T16:00:00Z'),
      createdAt: new Date('2026-07-04T12:00:00Z'),
    },
  ];

  for (const t of trips) {
    await prisma.trip.create({ data: t });
  }
  console.log('Seeded trips.');

  // 7. Create Maintenance Logs
  const v3 = seededVehicles[2]; // Yamaha Bike (IN_SHOP)
  const maintenanceLogs = [
    {
      vehicleId: v3.id,
      description: 'Replace battery pack and front brakes',
      cost: 450,
      status: 'OPEN',
    },
    {
      vehicleId: v1.id,
      description: 'Regular engine oil and filter change',
      cost: 120,
      status: 'CLOSED',
      createdAt: new Date('2026-06-15'),
      closedAt: new Date('2026-06-15'),
    },
    {
      vehicleId: v2.id,
      description: 'Transmission fluid flush and diagnostics',
      cost: 850,
      status: 'CLOSED',
      createdAt: new Date('2026-06-20'),
      closedAt: new Date('2026-06-21'),
    },
  ];

  for (const log of maintenanceLogs) {
    await prisma.maintenanceLog.create({ data: log });
  }
  console.log('Seeded maintenance logs.');

  // 8. Seed Fuel Logs for Analytics
  const fuelLogs = [
    { vehicleId: v1.id, liters: 55, cost: 82.5, date: new Date('2026-07-01') },
    { vehicleId: v1.id, liters: 60, cost: 90.0, date: new Date('2026-07-04') },
    { vehicleId: v2.id, liters: 250, cost: 375.0, date: new Date('2026-07-02') },
    { vehicleId: v2.id, liters: 280, cost: 420.0, date: new Date('2026-07-06') },
    { vehicleId: v4.id, liters: 80, cost: 120.0, date: new Date('2026-07-03') },
  ];

  for (const f of fuelLogs) {
    await prisma.fuelLog.create({ data: f });
  }
  console.log('Seeded fuel logs.');

  // 9. Seed Expenses for Analytics
  const expenses = [
    { vehicleId: v1.id, type: 'Toll', amount: 35.0, date: new Date('2026-07-01') },
    { vehicleId: v2.id, type: 'Toll', amount: 120.0, date: new Date('2026-07-02') },
    { vehicleId: v2.id, type: 'Toll', amount: 95.0, date: new Date('2026-07-05') },
    { vehicleId: v4.id, type: 'Misc', amount: 45.0, date: new Date('2026-07-03') },
    { vehicleId: v1.id, type: 'Toll', amount: 25.0, date: new Date('2026-07-07') },
  ];

  for (const e of expenses) {
    await prisma.expense.create({ data: e });
  }
  console.log('Seeded expenses.');

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
