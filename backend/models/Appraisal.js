const mongoose = require('mongoose');

const appraisalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  period: {
    type: String,
    required: [true, 'Please provide appraisal period'],
  },
  achievements: [String],
  improvements: [String],
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed'],
    default: 'draft',
  },
  managerComment: String,
  submittedAt: Date,
  reviewedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

appraisalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Appraisal', appraisalSchema);