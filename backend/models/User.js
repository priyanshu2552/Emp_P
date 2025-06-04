const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee',
  },
  Department: {
    type: String,
  },
  EmployeeId: {
    type: String,
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    validate: {
      validator: async function(value) {
        if (!value) return true;
        const manager = await mongoose.model('User').findById(value);
        return manager && (manager.role === 'manager' || manager.role === 'admin');
      },
      message: 'Manager must be either an admin or manager role'
    }
  },
  contact: String,
  address: String,
  profileImage: {
    data: Buffer,
    contentType: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);