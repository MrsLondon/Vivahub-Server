require('dotenv').config();
const mongoose = require('mongoose');
const seedUsers = require('./userSeeds');
const seedSalons = require('./salonSeeds');
const seedServices = require('./serviceSeeds');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Run seeds in sequence
    console.log('Starting database seeding...');
    
    // Seed users first
    const users = await seedUsers();
    console.log('Users seeded successfully');

    // Seed salons
    const salons = await seedSalons();
    console.log('Salons seeded successfully');

    // Seed services
    const services = await seedServices();
    console.log('Services seeded successfully');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 