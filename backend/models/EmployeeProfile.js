const mongoose = require('mongoose');

const employeeProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  employedId: {
    type: String,
    unique: true,
    required: true,
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  department: String,
  position: {
    type: String,
    enum: ['junior', 'manager'],
    default: 'junior',
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('EmployeeProfile', employeeProfileSchema);