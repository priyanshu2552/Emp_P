const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
  name: { type: String, required: true },
  target: { type: String, required: true },
  weight: { type: Number, min: 1, max: 100 },
  selfRating: { type: Number, min: 1, max: 5, default: null },
  managerRating: { type: Number, min: 1, max: 5, default: null },
  achievements: String,
  areasToImprove: String
});

const kraSchema = new mongoose.Schema({
  name: { type: String, required: true },
  kpis: [kpiSchema],
  selfRating: { type: Number, min: 1, max: 5, default: null },
  managerRating: { type: Number, min: 1, max: 5, default: null },
  achievements: String,
  areasToImprove: String
});

const appraisalSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  manager: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  period: { 
    type: String, 
    required: true,
    enum: ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'] 
  },
  year: {
    type: Number,
    required: true,
    default: new Date().getFullYear()
  },
  
  // Section A: Performance Review
  kras: [kraSchema],
  
  // Section B: General Review
  additionalComments: String,
  careerGoals: String,
  
  // Manager Evaluation
  managerFeedback: String,
  actionPlan: String,
  overallRating: { 
    type: Number, 
    min: 1, 
    max: 5,
    default: null 
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'completed'],
    default: 'draft'
  },
  submittedAt: Date,
  reviewedAt: Date,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

appraisalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update timestamps based on status changes
  if (this.isModified('status')) {
    if (this.status === 'submitted') {
      this.submittedAt = new Date();
    } else if (this.status === 'reviewed') {
      this.reviewedAt = new Date();
    }
  }
  
  next();
});

module.exports = mongoose.model('Appraisal', appraisalSchema);