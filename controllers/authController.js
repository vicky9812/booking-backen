const User = require('../models/User');
const { validationResult } = require('express-validator');
const responseHandler = require('../utils/responseHandler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { name, email, password, role, phone, bio } = req.body;

    if (!email || !password) {
      return responseHandler.error(res, 'Email and password are required', 400);
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return responseHandler.error(res, 'User already exists', 400);
    }

    // Create new user
    console.log('Creating new user with:', { name, email, role });
    user = new User({
      name,
      email,
      password,
      role: role || 'client', // Default to client if not specified
      phone,
      bio
    });

    const savedUser = await user.save();
    console.log('User saved successfully:', savedUser ? 'Yes' : 'No');

    // Create and return JWT token
    const token = user.getSignedJwtToken();
    console.log('Generated token for user');

    responseHandler.success(res, 201, {
      user: {
        id: user._id || 'mock-id',
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('Error in register:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Login user and get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return responseHandler.error(res, 'Email and password are required', 400);
    }

    // Check if user exists
    console.log('Finding user with email:', email);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found for email:', email);
      return responseHandler.error(res, 'Invalid credentials', 400);
    }
    console.log('User found in database');

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch ? 'Match' : 'No match');
    if (!isMatch) {
      return responseHandler.error(res, 'Invalid credentials', 400);
    }

    // Create and return JWT
    const token = user.getSignedJwtToken();
    console.log('Generated token for login');

    responseHandler.success(res, 200, {
      user: {
        id: user._id || 'mock-id',
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('Error in login:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    responseHandler.success(res, 200, { user });
  } catch (err) {
    console.error('Error in getMe:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, bio, address, specialization } = req.body;
    
    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (email) profileFields.email = email;
    if (phone) profileFields.phone = phone;
    if (bio) profileFields.bio = bio;
    if (specialization) profileFields.specialization = specialization;
    
    // Handle address fields
    if (address) {
      profileFields.address = {};
      if (address.street) profileFields.address.street = address.street;
      if (address.city) profileFields.address.city = address.city;
      if (address.state) profileFields.address.state = address.state;
      if (address.zipCode) profileFields.address.zipCode = address.zipCode;
      if (address.country) profileFields.address.country = address.country;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    );

    responseHandler.success(res, 200, { user: updatedUser });
  } catch (err) {
    console.error('Error in updateProfile:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return responseHandler.error(res, 'Current password is incorrect', 400);
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    responseHandler.success(res, 200, { message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error in changePassword:', err.message);
    responseHandler.serverError(res, err.message);
  }
};