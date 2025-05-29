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
    type: String, // e.g., "Q1 2025"
    required: [true, 'Please provide appraisal period'],
  },

  // Work Summary
  projectName: String,
  workSummary: String, // Brief summary of responsibilities and achievements
  technologiesUsed: [String],
  achievements: [String],

  // Ratings
  selfRating: {
    technicalSkills: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    teamwork: { type: Number, min: 1, max: 5 },
  },

  // Optional
  additionalComments: String,
  attachments: [String], // filenames or URLs

  // Manager Review
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'rejected'],
    default: 'draft',
  },
  managerComment: String,
  finalRating: {
    type: Number,
    min: 1,
    max: 5,
  },

  // Timestamps
  submittedAt: Date,
  reviewedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

// Auto-update updatedAt
appraisalSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Appraisal', appraisalSchema);
