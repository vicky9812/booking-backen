const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const swaggerSetup = require('./swagger');

// Routes
const authRoutes = require('./routes/auth');
const providerRoutes = require('./routes/provider');
const clientRoutes = require('./routes/client');
const adminRoutes = require('./routes/admin');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/admin', adminRoutes);

// Base route for API health check
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to Booking Backend API'
  });
});

// Error handling middleware
app.use(errorHandler);

// Setup Swagger Documentation
swaggerSetup(app);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});