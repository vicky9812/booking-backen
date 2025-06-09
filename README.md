# Scalable Booking Backend API

A multi-provider appointment booking system backend API built with Node.js, Express, and MongoDB. This system allows service providers to register and manage their availability while clients can book appointments with providers.

## Features

### Core Functionalities
- Provider registration and availability management
- Client registration, provider browsing, and appointment booking
- Admin panel for managing users, bookings, and viewing system stats
- Authentication system with JWT
- REST API endpoints for all booking system operations

### Technical Features
- Modular code architecture (MVC pattern)
- MongoDB with Mongoose ODM
- JWT authentication and role-based access control
- Advanced filtering and pagination
- Error handling and input validation

## API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user (client or provider)
- `POST /api/auth/login` - Authenticate user and get token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/change-password` - Change user password

### Provider Routes
- `POST /api/providers/availability` - Create new availability slot
- `GET /api/providers/availability` - Get all availability slots
- `PUT /api/providers/availability/:id` - Update availability slot
- `DELETE /api/providers/availability/:id` - Delete availability slot
- `GET /api/providers/bookings` - Get all bookings for the provider
- `PUT /api/providers/bookings/:id/status` - Update booking status
- `GET /api/providers/dashboard` - Get provider dashboard stats

### Client Routes
- `GET /api/clients/providers` - Get all available providers
- `GET /api/clients/providers/:id/availability` - Get availability for a provider
- `POST /api/clients/bookings` - Create a new booking
- `GET /api/clients/bookings` - Get all client's bookings
- `GET /api/clients/bookings/:id` - Get a specific booking
- `PUT /api/clients/bookings/:id/cancel` - Cancel a booking
- `POST /api/clients/payments` - Process payment for a booking

### Admin Routes
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/bookings/:id` - Get booking by ID
- `PUT /api/admin/bookings/:id` - Update booking
- `DELETE /api/admin/bookings/:id` - Delete booking
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/payments` - Get all payments

## Setup and Installation

### Standard Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=24h
   ```
4. Run the server:
   ```
   npm run dev
   ```

### Docker Setup

1. Make sure you have Docker and Docker Compose installed on your system.
2. Clone the repository
3. Build and run the containers:
   ```
   docker-compose up --build
   ```
   This will start both the Node.js application and MongoDB containers.
4. Access the API at `http://localhost:5000`
5. To stop the containers:
   ```
   docker-compose down
   ```

## API Documentation

The API is documented using Swagger UI. Once the server is running, you can access the API documentation at:

```
http://localhost:5000/api-docs
```

This interactive documentation allows you to:
- Browse all available endpoints
- See required parameters and response formats
- Test API endpoints directly from the browser

## Technologies Used
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Express Validator for request validation
- BCrypt for password hashing

## Future Enhancements
- Implement email notifications for booking confirmations and reminders
- Add support for recurring availability patterns
- Integrate real payment processing with Stripe or similar
- Implement socket.io for real-time updates
- Build appointment calendar view endpoints

## License
[MIT](LICENSE)