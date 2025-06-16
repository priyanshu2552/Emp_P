const mongoose = require('mongoose');

const workItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  completionStatus: { 
    type: String, 
    enum: ['completed', 'in-progress', 'not-started', 'delayed'],
    required: true 
  },
  codeQualityRating: { type: Number, min: 1, max: 5 },
  timelyDelivery: { type: Boolean },
  technologiesUsed: [String],
  challenges: String,
  solutions: String,
  learnings: String
}, { _id: false });

const goalSchema = new mongoose.Schema({
  description: { type: String, required: true },
  achieved: Boolean,
  evidence: String,
  rating: { type: Number, min: 1, max: 5 }
}, { _id: false });

const keyResultSchema = new mongoose.Schema({
  description: { type: String, required: true },
  deliveredOnTime: Boolean,
  qualityRating: { type: Number, min: 1, max: 5 },
  comments: String
}, { _id: false });

const appraisalSchema = new mongoose.Schema({
  manager: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    type: String,
    enum: ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'],
    required: true
  },
  year: {
    type: Number,
    required: true,
    default: new Date().getFullYear()
  },

  // Work Sections
  workItems: [workItemSchema],
  goals: [goalSchema],
  keyResults: [keyResultSchema],
  additionalComments: String,

  // Employee Submission
  employeeSubmission: {
    submittedAt: Date,
    selfRating: { type: Number, min: 1, max: 5 },
    finalComments: String
  },

  // Manager Review
  managerReview: {
    reviewedAt: Date,
    overallRating: { type: Number, min: 1, max: 5 },
    feedback: String,
    acknowledgement: Boolean,
    actionItems: [String]
  },

  // Status Tracking
  status: {
    type: String,
    enum: ['draft', 'sent-to-employee', 'submitted-by-employee', 'reviewed-by-manager'],
    default: 'draft'
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

// Prevent duplicate appraisals for same period
appraisalSchema.index({ employee: 1, period: 1, year: 1 }, { unique: true });

appraisalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-populate employee details when status changes to sent-to-employee
  if (this.isModified('status') && this.status === 'sent-to-employee') {
    this.employeeSubmission = this.employeeSubmission || {};
    this.employeeSubmission.submittedAt = new Date();
  }
  
  if (this.isModified('status') && this.status === 'reviewed-by-manager') {
    this.managerReview = this.managerReview || {};
    this.managerReview.reviewedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Appraisal', appraisalSchema);