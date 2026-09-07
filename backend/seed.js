const mongoose = require('mongoose');
const User = require('./models/User');
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

    // Clear and Seed default Plazas if empty
    const plazaCount = await TollPlaza.countDocuments();
    if (plazaCount === 0) {
      await TollPlaza.create([
        {
          name: 'Bangalore Expressway Plaza',
          location: 'NH-44, Bangalore',
          rates: { Bike: 20, Car: 80, Bus: 150, Truck: 250, Emergency: 0 }
        },
        {
          name: 'Delhi-Gurgaon Gating Node',
          location: 'NH-48, Gurgaon',
          rates: { Bike: 15, Car: 65, Bus: 120, Truck: 200, Emergency: 0 }
        }
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
