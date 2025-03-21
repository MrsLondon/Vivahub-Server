const mongoose = require('mongoose');
const Salon = require('../models/Salon');
const User = require('../models/User');

const salonSeeds = [
  {
    name: 'Elegant Beauty Salon',
    description: 'Luxury beauty services for all',
    address: '789 Business Ave, City',
    phone: '1112223333',
    email: 'salon1@PR.com',
    businessType: 'Salon',
    location: 'New York, NY',
    openingHours: {
      monday: '9:00-18:00',
      tuesday: '9:00-18:00',
      wednesday: '9:00-18:00',
      thursday: '9:00-18:00',
      friday: '9:00-18:00',
      saturday: '10:00-16:00',
      sunday: 'Closed'
    },
    amenities: ['WiFi', 'Parking', 'Wheelchair Accessible'],
    images: [
      'https://example.com/salon1-1.jpg',
      'https://example.com/salon1-2.jpg'
    ],
    rating: 4.5,
    totalReviews: 10
  },
  {
    name: 'Modern Style Studio',
    description: 'Contemporary styling services',
    address: '321 Commerce St, City',
    phone: '4445556666',
    email: 'salon2@PR.com',
    businessType: 'Salon',
    location: 'New York, NY',
    openingHours: {
      monday: '10:00-19:00',
      tuesday: '10:00-19:00',
      wednesday: '10:00-19:00',
      thursday: '10:00-19:00',
      friday: '10:00-19:00',
      saturday: '11:00-17:00',
      sunday: 'Closed'
    },
    amenities: ['WiFi', 'Parking', 'Wheelchair Accessible', 'Refreshments'],
    images: [
      'https://example.com/salon2-1.jpg',
      'https://example.com/salon2-2.jpg'
    ],
    rating: 4.8,
    totalReviews: 15
  }
];

const seedSalons = async () => {
  try {
    // Clear existing salons
    await Salon.deleteMany({});
    console.log('Cleared existing salons');

    // Get business owners
    const businessOwners = await User.find({ role: 'business' });
    
    // Add owner IDs to salons
    const salonsWithOwners = salonSeeds.map((salon, index) => ({
      ...salon,
      owner: businessOwners[index]._id
    }));

    // Insert salons
    const createdSalons = await Salon.insertMany(salonsWithOwners);
    console.log('Seeded salons:', createdSalons.length);
    return createdSalons;
  } catch (error) {
    console.error('Error seeding salons:', error);
    throw error;
  }
};

module.exports = seedSalons; 