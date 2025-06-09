const mongoose = require('mongoose');
const config = require('./config');

// Create a simple in-memory mock database
const mockDB = {
  users: [],
  
  // Find a user by email
  findUser: function(email) {
    return this.users.find(u => u.email === email);
  },
  
  // Save a user to our mock database
  saveUser: function(user) {
    const newUser = {
      _id: `mock_${Math.random().toString(36).substr(2, 9)}`,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role || 'client',
      phone: user.phone || '',
      bio: user.bio || '',
      createdAt: new Date()
    };
    this.users.push(newUser);
    console.log('User saved to mockDB:', newUser.email);
    return newUser;
  }
};

// Create the User model directly since we're mocking
const UserModel = function(userData) {
  if (!(this instanceof UserModel)) {
    return new UserModel(userData);
  }
  
  this._id = `mock_${Math.random().toString(36).substr(2, 9)}`;
  this.name = userData?.name || '';
  this.email = userData?.email || '';
  this.password = userData?.password || '';
  this.role = userData?.role || 'client';
  this.phone = userData?.phone || '';
  this.bio = userData?.bio || '';
  
  // Save method for the user instance
  this.save = async function() {
    if (mockDB.findUser(this.email)) {
      throw new Error('User already exists');
    }
    const savedUser = mockDB.saveUser(this);
    this._id = savedUser._id;
    return this;
  };
  
  // JWT token generation
  this.getSignedJwtToken = function() {
    return `mock_token_${this.email}_${Date.now()}`;
  };
  
  // Password verification
  this.matchPassword = async function(enteredPassword) {
    return this.password === enteredPassword;
  };
};

// Static methods for UserModel
UserModel.findOne = async function(query) {
  console.log('Mock findOne called with:', query);
  if (query && query.email) {
    const user = mockDB.findUser(query.email);
    console.log('Found user in mockDB:', user ? `Yes - ${user.email}` : 'No');
    if (user) {
      // Create a proper user model from the found data
      const foundUser = new UserModel({
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role
      });
      foundUser._id = user._id;
      
      // Add the select method for password inclusion
      foundUser.select = function() { return this; };
      return foundUser;
    }
  }
  return null;
};

const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'development' && (!process.env.MONGO_URI || !process.env.MONGO_URI.startsWith('mongodb'))) {
      // In development without a real MongoDB connection, use mockDB
      console.log('Running in mock database mode for demonstration');
      
      // Override the mongoose.model function to return our mock models
      mongoose.model = function(modelName, schema) {
        if (modelName === 'User') {
          return UserModel;
        } else {
          // For other models, create basic mock implementations
          const MockModel = function() {};
          MockModel.find = async () => [];
          MockModel.findById = async () => null;
          MockModel.findOne = async () => null;
          MockModel.create = async () => ({_id: `mock_${Math.random().toString(36).substr(2, 9)}`});
          return MockModel;
        }
      };
      
      return; // Skip the real MongoDB connection
      
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // MongoDB connection options
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.log('Continuing without database connection for demonstration purposes');
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;