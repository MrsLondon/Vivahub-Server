const mongoose = require("mongoose");
const User = require("../models/User");
const Salon = require("../models/Salon");
const Service = require("../models/Service");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Database connection
const MONGODB_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/vivahub-dev";

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
  },
  {
    email: "jane@example.com",
    password: "password123",
    firstName: "Jane",
    lastName: "Smith",
    role: "customer",
    phone: "0987654321",
  },
  {
    email: "alex@example.com",
    password: "password123",
    firstName: "Alex",
    lastName: "Johnson",
    role: "customer",
    phone: "5556667777",
  },
  {
    email: "maria@example.com",
    password: "password123",
    firstName: "Maria",
    lastName: "Garcia",
    role: "customer",
    phone: "8889990000",
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
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "10:00", close: "16:00" },
        sunday: { open: null, close: null }, // Closed
      },
    },
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
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "10:00", close: "16:00" },
        sunday: { open: null, close: null }, // Closed
      },
    },
  },
  {
    email: "salon3@example.com",
    password: "password123",
    firstName: "Emma",
    lastName: "Davis",
    role: "business",
    phone: "7778889999",
    address: "555 Market St, City",
    businessDetails: {
      businessName: "Glamour & Glow Beauty Salon",
      businessType: "Salon",
      description: "Premium beauty treatments and services",
      address: "555 Market St, City",
      phone: "7778889999",
      email: "salon3@example.com",
      openingHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "10:00", close: "16:00" },
        sunday: { open: null, close: null }, // Closed
      },
    },
  },
  {
    email: "salon4@example.com",
    password: "password123",
    firstName: "David",
    lastName: "Brown",
    role: "business",
    phone: "2223334444",
    address: "777 Fashion Blvd, City",
    businessDetails: {
      businessName: "Sergi's Salon",
      businessType: "Salon",
      description: "Cutting-edge hair design and styling",
      address: "777 Fashion Blvd, City",
      phone: "2223334444",
      email: "salon4@example.com",
      openingHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "10:00", close: "16:00" },
        sunday: { open: null, close: null }, // Closed
      },
    },
  },
  {
    email: "salon5@example.com",
    password: "password123",
    firstName: "Olivia",
    lastName: "Martinez",
    role: "business",
    phone: "6667778888",
    address: "999 Spa Lane, City",
    businessDetails: {
      businessName: "Brunella Salon",
      businessType: "Salon",
      description: "Relaxing spa and beauty treatments",
      address: "999 Spa Lane, City",
      phone: "6667778888",
      email: "salon5@example.com",
      openingHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "10:00", close: "16:00" },
        sunday: { open: null, close: null }, // Closed
      },
    },
  },
];

const salonData = [
  {
    name: "Elegant Beauty Salon",
    location: "789 Business Ave, City",
    phone: "1112223333",
    email: "salon1@example.com",
    description:
      "Luxury beauty services for all ages and styles. Our experienced team provides top-quality services in a relaxing environment.",
    owner: null, // Will be set after user creation
    services: [], // Will be populated after service creation
    coordinates: {
      lat: 51.5074,
      lng: -0.1278,
    },
  },
  {
    name: "Modern Style Studio",
    location: "321 Commerce St, City",
    phone: "4445556666",
    email: "salon2@example.com",
    description:
      "Contemporary styling services with the latest trends and techniques. We focus on personalized experiences for each client.",
    owner: null, // Will be set after user creation
    services: [], // Will be populated after service creation
    coordinates: {
      lat: 51.5144,
      lng: -0.1337,
    },
  },
  {
    name: "Glamour & Glow Beauty Salon",
    location: "555 Market St, City",
    phone: "7778889999",
    email: "salon3@example.com",
    description:
      "Premium beauty treatments and services designed to make you look and feel your best. Specializing in luxury experiences.",
    owner: null, // Will be set after user creation
    services: [], // Will be populated after service creation
    coordinates: {
      lat: 51.5107,
      lng: -0.1231,
    },
  },
  {
    name: "Sergi's Salon",
    location: "777 Fashion Blvd, City",
    phone: "2223334444",
    email: "salon4@example.com",
    description:
      "Cutting-edge hair design and styling from award-winning stylists. We pride ourselves on innovation and excellence.",
    owner: null, // Will be set after user creation
    services: [], // Will be populated after service creation
    coordinates: {
      lat: 51.5033,
      lng: -0.1195,
    },
  },
  {
    name: "Brunella Salon",
    location: "999 Spa Lane, City",
    phone: "6667778888",
    email: "salon5@example.com",
    description:
      "Relaxing spa and beauty treatments in a tranquil setting. Our holistic approach combines wellness with beauty.",
    owner: null, // Will be set after user creation
    services: [], // Will be populated after service creation
    coordinates: {
      lat: 51.5012,
      lng: -0.1259,
    },
  },
];

const serviceData = [
  // Elegant Beauty Salon Services
  {
    name: "Women's Haircut",
    description: "Professional haircut service for women",
    price: 45,
    duration: 45,
    salon: null, // Will be set after salon creation
    languageSpoken: ["en-us", "es-es", "pt-br"],
  },
  {
    name: "Men's Haircut",
    description: "Professional haircut service for men",
    price: 30,
    duration: 30,
    salon: null,
    languageSpoken: ["en-us", "de-de"],
  },
  {
    name: "Hair Coloring",
    description: "Full hair coloring service",
    price: 80,
    duration: 120,
    salon: null,
    languageSpoken: ["it-it", "es-es", "pt-br"],
  },
  {
    name: "Blowout & Styling",
    description: "Professional blowout and styling",
    price: 40,
    duration: 45,
    salon: null,
    languageSpoken: ["en-us", "nl-nl"],
  },

  // Modern Style Studio Services
  {
    name: "Balayage",
    description: "Hand-painted highlights for a natural look",
    price: 120,
    duration: 150,
    salon: null,
    languageSpoken: ["es-es", "pt-br"],
  },
  {
    name: "Keratin Treatment",
    description: "Smoothing treatment for frizzy hair",
    price: 150,
    duration: 120,
    salon: null,
    languageSpoken: ["en-us", "it-it", "de-de"],
  },
  {
    name: "Hair Extensions",
    description: "Premium hair extension application",
    price: 200,
    duration: 180,
    salon: null,
    languageSpoken: ["pt-br", "nl-nl"],
  },
  {
    name: "Bridal Updo",
    description: "Elegant updo styling for brides",
    price: 85,
    duration: 60,
    salon: null,
    languageSpoken: ["en-us", "es-es"],
  },

  // Glamour & Glow Beauty Salon Services
  {
    name: "Manicure",
    description: "Classic manicure service",
    price: 25,
    duration: 45,
    salon: null,
    languageSpoken: ["it-it", "pt-br"],
  },
  {
    name: "Pedicure",
    description: "Luxury pedicure service",
    price: 35,
    duration: 60,
    salon: null,
    languageSpoken: ["en-us", "de-de"],
  },
  {
    name: "Gel Nails",
    description: "Long-lasting gel nail application",
    price: 40,
    duration: 60,
    salon: null,
    languageSpoken: ["es-es", "nl-nl"],
  },
  {
    name: "Facial Treatment",
    description: "Rejuvenating facial treatment",
    price: 65,
    duration: 60,
    salon: null,
    languageSpoken: ["en-us", "it-it"],
  },

  // Sergi's Salon Services
  {
    name: "Haircut & Styling",
    description: "Complete haircut and styling service",
    price: 55,
    duration: 60,
    salon: null,
    languageSpoken: ["pt-br", "de-de"],
  },
  {
    name: "Highlights",
    description: "Partial or full highlights",
    price: 90,
    duration: 90,
    salon: null,
    languageSpoken: ["en-us", "es-es", "it-it"],
  },
  {
    name: "Hair Mask Treatment",
    description: "Deep conditioning treatment",
    price: 30,
    duration: 30,
    salon: null,
    languageSpoken: ["nl-nl", "pt-br"],
  },
  {
    name: "Children's Haircut",
    description: "Haircut service for children",
    price: 25,
    duration: 30,
    salon: null,
    languageSpoken: ["en-us", "es-es"],
  },

  // Brunella Salon Services
  {
    name: "Full Body Massage",
    description: "Relaxing full body massage",
    price: 80,
    duration: 60,
    salon: null,
    languageSpoken: ["it-it", "de-de"],
  },
  {
    name: "Waxing Service",
    description: "Hair removal waxing service",
    price: 40,
    duration: 45,
    salon: null,
    languageSpoken: ["en-us", "pt-br"],
  },
  {
    name: "Makeup Application",
    description: "Professional makeup application",
    price: 60,
    duration: 60,
    salon: null,
    languageSpoken: ["es-es", "it-it"],
  },
  {
    name: "Eyebrow Shaping",
    description: "Professional eyebrow shaping and tinting",
    price: 25,
    duration: 30,
    salon: null,
    languageSpoken: ["en-us", "pt-br"],
  },
];

// Create a mix of past, current, and future bookings
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const lastWeek = new Date(today);
lastWeek.setDate(today.getDate() - 7);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);

const bookingData = [
  // Past bookings (completed) - can be reviewed
  {
    customerId: null, // Will be set after user creation
    salonId: null, // Will be set after salon creation
    serviceId: null, // Will be set after service creation
    appointmentDate: lastWeek,
    appointmentTime: "10:00",
    bookingStatus: "Service Completed",
    paymentStatus: "paid",
  },
  {
    customerId: null,
    salonId: null,
    serviceId: null,
    appointmentDate: lastWeek,
    appointmentTime: "14:00",
    bookingStatus: "Service Completed",
    paymentStatus: "paid",
  },
  {
    customerId: null,
    salonId: null,
    serviceId: null,
    appointmentDate: yesterday,
    appointmentTime: "11:30",
    bookingStatus: "Service Completed",
    paymentStatus: "paid",
  },

  // Current day bookings
  {
    customerId: null,
    salonId: null,
    serviceId: null,
    appointmentDate: today,
    appointmentTime: "16:00",
    bookingStatus: "Service Completed",
    paymentStatus: "paid",
  },

  // Future bookings
  {
    customerId: null,
    salonId: null,
    serviceId: null,
    appointmentDate: tomorrow,
    appointmentTime: "09:30",
    bookingStatus: "Pending",
    paymentStatus: "unpaid",
  },
  {
    customerId: null,
    salonId: null,
    serviceId: null,
    appointmentDate: tomorrow,
    appointmentTime: "13:00",
    bookingStatus: "Pending",
    paymentStatus: "paid",
  },
  {
    customerId: null,
    salonId: null,
    serviceId: null,
    appointmentDate: nextWeek,
    appointmentTime: "15:30",
    bookingStatus: "Pending",
    paymentStatus: "unpaid",
  },
];

// Sample review data (will be populated with actual IDs during seeding)
const reviewData = [
  {
    customerId: null,
    salonId: null,
    serviceId: null,
    rating: 5,
    comment:
      "Excellent service! My hair looks amazing and the staff was very friendly.",
    image:
      "https://res.cloudinary.com/duu9km8ss/image/upload/v1712428210/vivahub/reviews/sample_review_1.jpg",
  },
  {
    customerId: null,
    salonId: null,
    serviceId: null,
    rating: 4,
    comment:
      "Great experience overall. The salon was clean and the stylist was professional.",
    image:
      "https://res.cloudinary.com/duu9km8ss/image/upload/v1712428210/vivahub/reviews/sample_review_2.jpg",
  },
];

// Function to hash passwords
const hashPasswords = async (users) => {
  return Promise.all(
    users.map(async (user) => {
      // Use the same method as in the User model
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return { ...user, password: hashedPassword };
    })
  );
};

// Function to test login with seeded user
const testLogin = async () => {
  try {
    // Find a seeded user
    const testUser = await User.findOne({ email: "john@example.com" });
    if (!testUser) {
      console.log("Test user not found!");
      return;
    }

    console.log("Test user found:", testUser.email);

    // Test password comparison
    const testPassword = "password123";
    const isPasswordValid = await bcrypt.compare(
      testPassword,
      testUser.password
    );

    console.log("Password comparison test:");
    console.log("- Raw password:", testPassword);
    console.log("- Stored hash:", testUser.password);
    console.log("- Is valid:", isPasswordValid);
  } catch (error) {
    console.error("Error testing login:", error);
  }
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
    await Review.deleteMany({});
    console.log("Cleared existing data");

    // Create a test user directly using the User model
    const testUser = new User({
      email: "john@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      role: "customer",
    });
    await testUser.save();
    console.log("Test user created with User model's password hashing");

    // Hash passwords and create remaining users
    const remainingUsers = userData.filter(
      (user) => user.email !== "john@example.com"
    );
    const hashedUsers = await hashPasswords(remainingUsers);
    const users = await User.insertMany(hashedUsers);
    const allUsers = [testUser, ...users];
    console.log(`${allUsers.length} users seeded successfully`);

    // Create salons and link them to business owners
    const businessOwners = allUsers.filter((user) => user.role === "business");
    const defaultOpeningHours = {
      monday: { open: "09:00", close: "18:00" },
      tuesday: { open: "09:00", close: "18:00" },
      wednesday: { open: "09:00", close: "18:00" },
      thursday: { open: "09:00", close: "18:00" },
      friday: { open: "09:00", close: "18:00" },
      saturday: { open: "10:00", close: "16:00" },
      sunday: { open: null, close: null }, // Closed on Sundays
    };
    const salons = await Promise.all(
      salonData.map(async (salon, index) => {
        const newSalon = new Salon({
          ...salon,
          owner: businessOwners[index]._id,
          openingHours: defaultOpeningHours,
        });
        return newSalon.save();
      })
    );
    console.log(`${salons.length} salons seeded successfully`);

    // Create services and link them to salons
    const services = await Promise.all(
      serviceData.map(async (service, index) => {
        // Distribute services among salons (4 services per salon)
        const salonIndex = Math.floor(index / 4);
        const salon = salons[salonIndex];

        // Create the service
        const newService = new Service({
          ...service,
          salon: salon._id, // Associate the service with the salon
        });
        const savedService = await newService.save();

        // Add the service ID to the salon's services array
        salon.services.push(savedService._id);

        // Add the service's languages to the salon's languageSpoken array
        const updatedLanguages = new Set([
          ...(salon.languageSpoken || []), // Existing languages
          ...(service.languageSpoken || []), // Languages from the new service
        ]);
        salon.languageSpoken = Array.from(updatedLanguages); // Remove duplicates

        return savedService;
      })
    );

    // Save all salons after updating their services and languages
    await Promise.all(salons.map((salon) => salon.save()));

    console.log(`${services.length} services seeded successfully`);

    // Create bookings and link them to users, salons, and services
    const customers = allUsers.filter((user) => user.role === "customer");
    const bookings = await Promise.all(
      bookingData.map(async (booking, index) => {
        // Distribute bookings among customers, salons, and services
        const customerIndex = index % customers.length;
        const salonIndex = index % salons.length;
        const serviceIndex = (index * 2) % services.length; // Vary the services more

        const newBooking = new Booking({
          ...booking,
          customerId: customers[customerIndex]._id,
          salonId: salons[salonIndex]._id,
          serviceId: services[serviceIndex]._id,
        });
        return newBooking.save();
      })
    );
    console.log(`${bookings.length} bookings seeded successfully`);

    // Create reviews for completed bookings
    // Filter bookings with "service completed" status
    // IDs dos bookings para os quais queremos criar reviews

    // IDs dos bookings para os quais queremos criar reviews
    const bookingIdsForReviews = [
      "67f575c5faf9337830eadf0c",
      "67f575c5faf9337830eadf0e",
      "67f575c5faf9337830eadf0d",
      "67f575c5faf9337830eadf0f",
    ];

    // Converta os IDs fornecidos para ObjectId
    const bookingObjectIdsForReviews = bookingIdsForReviews.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Filtrar bookings com os IDs fornecidos
    const bookingsForReviews = bookings.filter((booking) =>
      bookingObjectIdsForReviews.some((id) => id.equals(booking._id))
    );
    console.log("Bookings for Reviews:", bookingsForReviews);

    const reviews = await Promise.all(
      bookingsForReviews.map(async (booking, index) => {
        console.log(
          `Processing review for booking at index ${index}:`,
          booking
        );

        // Criar o review
        const newReview = new Review({
          bookingId: booking._id, // Associa o review ao booking correto
          customerId: booking.customerId,
          salonId: booking.salonId,
          serviceId: booking.serviceId,
          rating: 5, // Exemplo de avaliação
          comment: `Review automático para o booking ${booking._id}`,
        });

        console.log(`Creating review for booking ID: ${booking._id}`);
        return newReview.save();
      })
    );

    console.log(
      `${reviews.filter((r) => r).length} reviews seeded successfully`
    );

    // Test login with a seeded user
    await testLogin();

    console.log("Database seeded successfully!");
    console.log("\nTest User Credentials:");
    console.log("- Customer: john@example.com / password123");
    console.log("- Business: salon1@example.com / password123");
    console.log("\nCompleted bookings that can be reviewed:");
    // completedBookings.forEach((booking, index) => {
    //   console.log(`- Booking ID: ${booking._id}`);
    // });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
