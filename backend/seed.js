const mongoose = require('mongoose');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const TollPlaza = require('./models/TollPlaza');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tollwise');
    console.log('MongoDB connected for seeding...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users.');

    // Seed Admin
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@tollwise.com',
      password: 'admin123',
      role: 'admin',
      walletBalance: 10000,
    });
    console.log('Admin seeded: admin@tollwise.com / admin123');

    // Seed Customer
    const customer = await User.create({
      name: 'John Doe Customer',
      email: 'customer@tollwise.com',
      password: 'customer123',
      role: 'customer',
      walletBalance: 1500,
    });
    console.log('Customer seeded: customer@tollwise.com / customer123');

    // Clear and Seed default vehicles
    await Vehicle.deleteMany({});
    console.log('Cleared existing vehicles.');

    const seededVehicles = await Vehicle.create([
      {
        vehicleNumber: 'AP40HA3030',
        owner: customer._id,
        ownerName: 'John Doe Customer',
        vehicleType: 'Car',
        vehicleModel: 'Toyota Innova Hycross',
        registrationNumber: 'RC-AP40-3030',
        fastagId: 'FT-8899112233',
        status: 'Active',
      },
      {
        vehicleNumber: 'KL49L2222',
        owner: customer._id,
        ownerName: 'John Doe Customer',
        vehicleType: 'Car',
        vehicleModel: 'Maruti Suzuki Dzire',
        registrationNumber: 'RC-KL49-2222',
        fastagId: 'FT-7766554433',
        status: 'Active',
      },
      {
        vehicleNumber: 'TS07JK8559',
        owner: customer._id,
        ownerName: 'John Doe Customer',
        vehicleType: 'Car',
        vehicleModel: 'Skoda Octavia Sedan',
        registrationNumber: 'RC-TS07-8559',
        fastagId: 'FT-6655443322',
        status: 'Active',
      },
      {
        vehicleNumber: 'KA22MB6663',
        owner: customer._id,
        ownerName: 'John Doe Customer',
        vehicleType: 'Car',
        vehicleModel: 'Volkswagen Polo GT',
        registrationNumber: 'RC-KA22-6663',
        fastagId: 'FT-3322114455',
        status: 'Active',
      },
      {
        vehicleNumber: 'TS09UB4521',
        owner: customer._id,
        ownerName: 'John Doe Customer',
        vehicleType: 'Car',
        vehicleModel: 'Hyundai Creta SX',
        registrationNumber: 'RC-TS09-4521',
        fastagId: 'FT-5544332211',
        status: 'Active',
      },
      {
        vehicleNumber: 'DL1CAB1234',
        owner: customer._id,
        ownerName: 'John Doe Customer',
        vehicleType: 'Car',
        vehicleModel: 'Honda City ZX',
        registrationNumber: 'RC-DL01-1234',
        fastagId: 'FT-4433221100',
        status: 'Active',
      },
      {
        vehicleNumber: 'MH12TR9999',
        owner: customer._id,
        ownerName: 'Logistics Trans Cargo',
        vehicleType: 'Truck',
        vehicleModel: 'Tata Prima 407 Heavy',
        registrationNumber: 'RC-MH12-9999',
        fastagId: 'FT-9988776655',
        status: 'Active',
      },
      {
        vehicleNumber: 'KA04EM0108',
        owner: customer._id,
        ownerName: 'City Trauma Emergency Unit',
        vehicleType: 'Emergency',
        vehicleModel: 'Force Emergency Life Support',
        registrationNumber: 'RC-KA04-0108',
        fastagId: 'FT-1081081081',
        status: 'Active',
      },
    ]);
    console.log(`Seeded ${seededVehicles.length} default registered vehicles.`);

    // Clear and Seed default Plazas if empty
    const plazaCount = await TollPlaza.countDocuments();
    if (plazaCount === 0) {
      await TollPlaza.create([
        {
          name: 'Bangalore Expressway Plaza',
          location: 'NH-44, Bangalore',
          rates: { Bike: 20, Car: 80, Bus: 150, Truck: 250, Emergency: 0 },
        },
        {
          name: 'Delhi-Gurgaon Gating Node',
          location: 'NH-48, Gurgaon',
          rates: { Bike: 15, Car: 65, Bus: 120, Truck: 200, Emergency: 0 },
        },
        {
          name: 'Hyderabad Outer Ring Plaza',
          location: 'ORR-Exit 11, Hyderabad',
          rates: { Bike: 25, Car: 90, Bus: 160, Truck: 280, Emergency: 0 },
        },
      ]);
      console.log('Default Toll Plazas seeded.');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
