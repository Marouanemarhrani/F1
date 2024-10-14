const mongoose = require('mongoose');
const { Schema } = mongoose;

// User schema
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  confirmPassword: {
    type: String,
    required: true,
    minlength: 6,
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    street: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
  },
  role: {
    type: Number,
    default: 0, 
  },
}, 
{
  timestamps: true, 
});

userSchema.pre('save', function (next) {
  this.confirmPassword = undefined;
  next();
});
const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
