const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const userSeeds = [
  // Customer users
  {
    email: 'john@PR.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'customer',
    phone: '1234567890',
    address: '123 Main St, City'
  },
  {
    email: 'jane@PR.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'customer',
    phone: '0987654321',
    address: '456 Oak St, City'
  },
  // Business owners
  {
    email: 'salon1@PR.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'business',
    phone: '1112223333',
    address: '789 Business Ave, City',
    businessDetails: {
      businessName: 'Elegant Beauty Salon',
      businessType: 'Salon',
      description: 'Luxury beauty services for all',
      address: '789 Business Ave, City',
      phone: '1112223333',
      email: 'salon1@PR.com',
      openingHours: {
        monday: '9:00-18:00',
        tuesday: '9:00-18:00',
        wednesday: '9:00-18:00',
        thursday: '9:00-18:00',
        friday: '9:00-18:00',
        saturday: '10:00-16:00',
        sunday: 'Closed'
      }
    }
  },
  {
    email: 'salon2@PR.com',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Wilson',
    role: 'business',
    phone: '4445556666',
    address: '321 Commerce St, City',
    businessDetails: {
      businessName: 'Modern Style Studio',
      businessType: 'Salon',
      description: 'Contemporary styling services',
      address: '321 Commerce St, City',
      phone: '4445556666',
      email: 'salon2@PR.com',
      openingHours: {
        monday: '10:00-19:00',
        tuesday: '10:00-19:00',
        wednesday: '10:00-19:00',
        thursday: '10:00-19:00',
        friday: '10:00-19:00',
        saturday: '11:00-17:00',
        sunday: 'Closed'
      }
    }
  }
];

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      userSeeds.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );

    // Insert users
    const createdUsers = await User.insertMany(hashedUsers);
    console.log('Seeded users:', createdUsers.length);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

module.exports = seedUsers; 