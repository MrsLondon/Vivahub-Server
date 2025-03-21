const mongoose = require('mongoose');
const Service = require('../models/Service');
const Salon = require('../models/Salon');

const serviceSeeds = [
  // Services for Elegant Beauty Salon
  {
    name: 'Haircut & Styling',
    description: 'Professional haircut and styling service',
    price: 50,
    duration: 60,
    category: 'Hair',
    salon: null, // Will be set dynamically
    image: 'https://example.com/haircut.jpg'
  },
  {
    name: 'Hair Coloring',
    description: 'Full hair coloring service with premium products',
    price: 100,
    duration: 120,
    category: 'Hair',
    salon: null, // Will be set dynamically
    image: 'https://example.com/coloring.jpg'
  },
  {
    name: 'Manicure',
    description: 'Luxury manicure with premium products',
    price: 35,
    duration: 45,
    category: 'Nails',
    salon: null, // Will be set dynamically
    image: 'https://example.com/manicure.jpg'
  },
  // Services for Modern Style Studio
  {
    name: 'Haircut & Styling',
    description: 'Modern haircut and styling service',
    price: 45,
    duration: 60,
    category: 'Hair',
    salon: null, // Will be set dynamically
    image: 'https://example.com/haircut2.jpg'
  },
  {
    name: 'Hair Treatment',
    description: 'Deep conditioning and treatment service',
    price: 80,
    duration: 90,
    category: 'Hair',
    salon: null, // Will be set dynamically
    image: 'https://example.com/treatment.jpg'
  },
  {
    name: 'Pedicure',
    description: 'Luxury pedicure with premium products',
    price: 40,
    duration: 60,
    category: 'Nails',
    salon: null, // Will be set dynamically
    image: 'https://example.com/pedicure.jpg'
  }
];

const seedServices = async () => {
  try {
    // Clear existing services
    await Service.deleteMany({});
    console.log('Cleared existing services');

    // Get salons
    const salons = await Salon.find();
    
    // Add salon IDs to services
    const servicesWithSalons = serviceSeeds.map((service, index) => ({
      ...service,
      salon: salons[Math.floor(index / 3)]._id // Distribute services between salons
    }));

    // Insert services
    const createdServices = await Service.insertMany(servicesWithSalons);
    console.log('Seeded services:', createdServices.length);
    return createdServices;
  } catch (error) {
    console.error('Error seeding services:', error);
    throw error;
  }
};

module.exports = seedServices; 