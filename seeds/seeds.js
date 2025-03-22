const mongoose = require("mongoose");
const User = require("../models/User");
const Salon = require("../models/Salon");
const Service = require("../models/Service");
const Booking = require("../models/Booking");
const bcrypt = require("bcryptjs");

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vivahub-dev";

// Seed data
const userData = [
  // Customer users
  {
    email: "john@example.com",
    password: "password123",
    firstName: "John",
    lastName: "Doe",
    role: "customer",
    phone: "1234567890",
    address: "123 Main St, City"
  },
  {
    email: "jane@example.com",
    password: "password123",
    firstName: "Jane",
    lastName: "Smith",
    role: "customer",
    phone: "0987654321",
    address: "456 Oak St, City"
  },
  // Business owners
  {
    email: "salon1@example.com",
    password: "password123",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "business",
    phone: "1112223333",
    address: "789 Business Ave, City",
    businessDetails: {
      businessName: "Elegant Beauty Salon",
      businessType: "Salon",
      description: "Luxury beauty services for all",
      address: "789 Business Ave, City",
      phone: "1112223333",
      email: "salon1@example.com",
      openingHours: {
        monday: "9:00-18:00",
        tuesday: "9:00-18:00",
        wednesday: "9:00-18:00",
        thursday: "9:00-18:00",
        friday: "9:00-18:00",
        saturday: "10:00-16:00",
        sunday: "Closed"
      }
    }
  },
  {
    email: "salon2@example.com",
    password: "password123",
    firstName: "Mike",
    lastName: "Wilson",
    role: "business",
    phone: "4445556666",
    address: "321 Commerce St, City",
    businessDetails: {
      businessName: "Modern Style Studio",
      businessType: "Salon",
      description: "Contemporary styling services",
      address: "321 Commerce St, City",
      phone: "4445556666",
      email: "salon2@example.com",
      openingHours: {
        monday: "10:00-19:00",
        tuesday: "10:00-19:00",
        wednesday: "10:00-19:00",
        thursday: "10:00-19:00",
        friday: "10:00-19:00",
        saturday: "11:00-17:00",
        sunday: "Closed"
      }
    }
  }
];

const salonData = [
  {
    name: "Elegant Beauty Salon",
    location: "789 Business Ave, City",
    phone: "1112223333",
    owner: null, // Will be set after user creation
    services: [] // Will be populated after service creation
  },
  {
    name: "Modern Style Studio",
    location: "321 Commerce St, City",
    phone: "4445556666",
    owner: null, // Will be set after user creation
    services: [] // Will be populated after service creation
  }
];

const serviceData = [
  {
    name: "Haircut",
    description: "Professional haircut service",
    price: 30,
    duration: 30,
    salon: null // Will be set after salon creation
  },
  {
    name: "Hair Coloring",
    description: "Full hair coloring service",
    price: 80,
    duration: 120,
    salon: null // Will be set after salon creation
  },
  {
    name: "Manicure",
    description: "Classic manicure service",
    price: 25,
    duration: 45,
    salon: null // Will be set after salon creation
  },
  {
    name: "Pedicure",
    description: "Luxury pedicure service",
    price: 35,
    duration: 60,
    salon: null // Will be set after salon creation
  }
];

const bookingData = [
  {
    customerId: null, // Will be set after user creation
    salonId: null, // Will be set after salon creation
    serviceId: null, // Will be set after service creation
    appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    appointmentTime: "10:00",
    status: "pending",
    paymentStatus: "unpaid"
  },
  {
    customerId: null, // Will be set after user creation
    salonId: null, // Will be set after salon creation
    serviceId: null, // Will be set after service creation
    appointmentDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
    appointmentTime: "14:00",
    status: "confirmed",
    paymentStatus: "paid"
  }
];

// Function to hash passwords
const hashPasswords = async (users) => {
  const salt = await bcrypt.genSalt(10);
  return Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return { ...user, password: hashedPassword };
    })
  );
};

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to the database
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding");

    // Clear existing data
    await User.deleteMany({});
    await Salon.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});
    console.log("Cleared existing data");

    // Hash passwords and create users
    const hashedUsers = await hashPasswords(userData);
    const users = await User.create(hashedUsers);
    console.log(`${users.length} users seeded successfully`);

    // Create salons and link them to business owners
    const businessOwners = users.filter(user => user.role === "business");
    const salons = await Promise.all(
      salonData.map(async (salon, index) => {
        const newSalon = new Salon({
          ...salon,
          owner: businessOwners[index]._id
        });
        return newSalon.save();
      })
    );
    console.log(`${salons.length} salons seeded successfully`);

    // Create services and link them to salons
    const services = await Promise.all(
      serviceData.map(async (service, index) => {
        const salonIndex = Math.floor(index / 2); // Distribute services between salons
        const newService = new Service({
          ...service,
          salon: salons[salonIndex]._id
        });
        return newService.save();
      })
    );
    console.log(`${services.length} services seeded successfully`);

    // Update salons with their services
    await Promise.all(
      salons.map(async (salon, index) => {
        const salonServices = services.filter(service => 
          service.salon.toString() === salon._id.toString()
        );
        salon.services = salonServices.map(service => service._id);
        return salon.save();
      })
    );

    // Create bookings and link them to users, salons, and services
    const customers = users.filter(user => user.role === "customer");
    const bookings = await Promise.all(
      bookingData.map(async (booking, index) => {
        const newBooking = new Booking({
          ...booking,
          customerId: customers[Math.floor(index / 2)]._id,
          salonId: salons[Math.floor(index / 2)]._id,
          serviceId: services[Math.floor(index / 2)]._id
        });
        return newBooking.save();
      })
    );
    console.log(`${bookings.length} bookings seeded successfully`);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 