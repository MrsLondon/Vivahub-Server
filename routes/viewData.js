const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Salon = require('../models/Salon');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// Route to get all data from all collections
router.get('/', async (req, res) => {
    try {
        // Fetch data from all collections
        const users = await User.find({}, { password: 0 }) // Exclude passwords
            .select('-__v');
        
        const salons = await Salon.find({})
            .populate('owner', 'firstName lastName email')
            .populate('services', 'name price duration')
            .select('-__v');
        
        const services = await Service.find({})
            .populate('salon', 'name location')
            .select('-__v');
        
        const bookings = await Booking.find({})
            .populate('customerId', 'firstName lastName email')
            .populate('salonId', 'name location')
            .populate('serviceId', 'name price duration')
            .select('-__v');

        const reviews = await Review.find({})
            .populate('customerId', 'firstName lastName')
            .populate('salonId', 'name')
            .populate('serviceId', 'name')
            .select('-__v');

        // Format the data
        const formattedData = {
            collections: {
                users: {
                    count: users.length,
                    data: users
                },
                salons: {
                    count: salons.length,
                    data: salons
                },
                services: {
                    count: services.length,
                    data: services
                },
                bookings: {
                    count: bookings.length,
                    data: bookings
                },
                reviews: {
                    count: reviews.length,
                    data: reviews
                }
            },
            totalCollections: 5,
            totalDocuments: users.length + salons.length + services.length + bookings.length + reviews.length,
            lastUpdated: new Date()
        };

        // Send JSON response
        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Route to get data from a specific collection
router.get('/:collection', async (req, res) => {
    try {
        const { collection } = req.params;
        let data;
        
        switch (collection.toLowerCase()) {
            case 'users':
                data = await User.find({}, { password: 0 })
                    .select('-__v');
                break;
            
            case 'salons':
                data = await Salon.find({})
                    .populate('owner', 'firstName lastName email')
                    .populate('services', 'name price duration')
                    .select('-__v');
                break;
            
            case 'services':
                data = await Service.find({})
                    .populate('salon', 'name location')
                    .select('-__v');
                break;
            
            case 'bookings':
                data = await Booking.find({})
                    .populate('customerId', 'firstName lastName email')
                    .populate('salonId', 'name location')
                    .populate('serviceId', 'name price duration')
                    .select('-__v');
                break;
            
            case 'reviews':
                data = await Review.find({})
                    .populate('customerId', 'firstName lastName')
                    .populate('salonId', 'name')
                    .populate('serviceId', 'name')
                    .select('-__v');
                break;
            
            default:
                return res.status(404).json({ 
                    error: 'Collection not found',
                    message: `Collection '${collection}' does not exist` 
                });
        }

        // Format the response
        const formattedData = {
            collection: collection,
            count: data.length,
            data: data,
            lastUpdated: new Date()
        };

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching collection data:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

module.exports = router; 