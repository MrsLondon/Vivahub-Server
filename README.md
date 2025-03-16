# VivaHub - Backend

VivaHub is a modern beauty salon booking platform, inspired by TreatWell, that enables customers to find salons, book appointments, and make secure payments. The backend is built with Express.js and MongoDB, providing authentication, service listings, and booking management.

## Features

- **User Authentication:** Secure login and registration with JWT.
- **Salon & Service Management:** CRUD operations for salon owners.
- **Appointment Booking:** Customers can book, reschedule, and cancel appointments.
- **Payment Integration:** Secure payments with Stripe or PayPal.
- **Email Notifications (Future Feature):** Booking confirmations and reminders via email.

## Technologies Used

- **Backend Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT & Bcrypt
- **Payment API:** Stripe or PayPal (to be implemented)
- **Email API (Future Feature):** Nodemailer or SendGrid

## Installation

Follow these steps to get the backend running locally:

### Clone the Repository
```bash
git clone https://github.com/yourusername/vivahub-backend.git
```

### Navigate to the Project Directory
```bash
cd vivahub-backend
```

### Install Dependencies
```bash
npm install
```

### Set Up Environment Variables
Create a `.env` file in the root directory and add:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET=your_stripe_secret (if using Stripe)
```

### Run the Server
```bash
npm run dev
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

#### Salon & Services
- `GET /api/salons` - Get all salons
- `POST /api/salons` - Create a new salon (Salon Owners only)
- `GET /api/services` - Get all services
- `POST /api/services` - Add a new service (Salon Owners only)

#### Booking
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/user/:userId` - Get user bookings
- `DELETE /api/bookings/:bookingId` - Cancel a booking

## Deployment
The backend will be deployed on **Render**.

## Contributing
We welcome contributions! To contribute:

1. **Fork the repository** on GitHub.
2. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. **Commit your changes:**
   ```bash
   git commit -m "Add new feature"
   ```
4. **Push to your fork and submit a pull request:**
   ```bash
   git push origin feature-name
   ```

## Contact
For questions or suggestions, feel free to reach out:

- **GitHub:** (https://github.com/MrsLondon)
- **LinkedIn:** [Ayat Abu Haj]

### Collaborators
- **Brunella Carvalho**
- **Victor Marchesi**

