const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { hashPassword, comparePassword } = require('../helpers/passwordHelper');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
}, {
  timestamps: true
});

// Add virtual field for password confirmation
userSchema.virtual('passwordConfirmation')
  .get(function() {
    return this._passwordConfirmation;
  })
  .set(function(value) {
    this._passwordConfirmation = value;
  });

// Pre-save hook to validate password confirmation
userSchema.pre('save', function(next) {
  // Only run this if the password is being modified or a new user is created
  if (this.isModified('password')) {
    // Only check password confirmation when creating a new user
    if (this.isNew && this.password !== this.passwordConfirmation) {
      return next(new Error('Passwords do not match'));
    }
  }
  next();
});
// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('Candidate Password for Login:', candidatePassword); // Log entered password
  console.log('Stored Hashed Password:', this.password); // Log stored hashed password

  const isMatch = await bcrypt.compare(candidatePassword, this.password); // Compare using bcrypt
  console.log('Password Match Result:', isMatch); // Log result

  return isMatch;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
