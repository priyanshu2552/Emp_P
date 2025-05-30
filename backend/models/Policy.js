// models/Policy.js
const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  description: String,
  fileUrl: {
    type: String,
    required: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

policySchema.pre('save', function (next) {
  if (this.isModified()) this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Policy', policySchema);
