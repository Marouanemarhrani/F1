const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../helpers/passwordHelper');

// Register User
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, passwordConfirmation } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      passwordConfirmation
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trim the password and email to avoid hidden characters or spaces
    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Ensure the password is trimmed
    const isMatch = await user.comparePassword(password.trim()); 
    console.log('Trimmed Password for Comparison:', password.trim());  // Log trimmed password
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token or return user details as needed
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Allow only the first name and last name to be updated
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;

    // Save the updated user details
    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, passwordConfirmation } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (newPassword !== passwordConfirmation) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    // Hash the new password
    user.password = await hashPassword(newPassword);
    console.log('New Hashed Password:', user.password);

    // Save the user with the new password
    await user.save();

    // Log the user after saving to verify if the new password is saved
    const updatedUser = await User.findById(req.user.id);
    console.log('User after saving:', updatedUser);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user account
    await user.remove();
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUser
};
