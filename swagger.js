const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Multi-Provider Appointment Booking API',
      version: '1.0.0',
      description: 'API documentation for the multi-provider appointment booking system',
      contact: {
        name: 'API Support',
        email: 'support@bookingsystem.com'
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.bookingsystem.com' 
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password'
            },
            role: {
              type: 'string',
              enum: ['client', 'provider', 'admin'],
              description: 'User role in the system'
            },
            profileImage: {
              type: 'string',
              description: 'URL to user profile image'
            },
            bio: {
              type: 'string',
              description: 'Short biography for providers'
            },
            specialties: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Provider specialties'
            },
            contactNumber: {
              type: 'string',
              description: 'User contact number'
            }
          }
        },
        Availability: {
          type: 'object',
          required: ['provider', 'date', 'startTime', 'endTime', 'status'],
          properties: {
            provider: {
              type: 'string',
              description: 'Provider ID'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date of availability (YYYY-MM-DD)'
            },
            startTime: {
              type: 'string',
              format: 'time',
              description: 'Start time of availability slot (HH:MM)'
            },
            endTime: {
              type: 'string',
              format: 'time',
              description: 'End time of availability slot (HH:MM)'
            },
            status: {
              type: 'string',
              enum: ['available', 'booked', 'blocked'],
              description: 'Status of availability slot'
            }
          }
        },
        Booking: {
          type: 'object',
          required: ['client', 'provider', 'date', 'startTime', 'endTime'],
          properties: {
            client: {
              type: 'string',
              description: 'Client ID'
            },
            provider: {
              type: 'string',
              description: 'Provider ID'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date of booking (YYYY-MM-DD)'
            },
            startTime: {
              type: 'string',
              format: 'time',
              description: 'Start time of booking (HH:MM)'
            },
            endTime: {
              type: 'string',
              format: 'time',
              description: 'End time of booking (HH:MM)'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'completed', 'cancelled'],
              description: 'Status of booking'
            },
            notes: {
              type: 'string',
              description: 'Additional notes for the booking'
            },
            service: {
              type: 'string',
              description: 'Service type requested'
            }
          }
        },
        Payment: {
          type: 'object',
          required: ['booking', 'amount', 'status', 'paymentDate'],
          properties: {
            booking: {
              type: 'string',
              description: 'Booking ID'
            },
            amount: {
              type: 'number',
              description: 'Payment amount'
            },
            currency: {
              type: 'string',
              description: 'Currency code (e.g., USD, EUR)'
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded'],
              description: 'Payment status'
            },
            paymentMethod: {
              type: 'string',
              description: 'Method of payment (e.g., credit card, PayPal)'
            },
            paymentDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date and time of payment'
            },
            transactionId: {
              type: 'string',
              description: 'External payment provider transaction ID'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              default: false
            },
            message: {
              type: 'string'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './models/*.js', './controllers/*.js'],
};

const specs = swaggerJsdoc(options);

const swaggerSetup = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { 
    explorer: true,
    customSiteTitle: "Booking API Documentation",
    customCss: '.swagger-ui .topbar { display: none }'
  }));
  
  // Route to serve the OpenAPI spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

module.exports = swaggerSetup;