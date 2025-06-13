const mongoose = require('mongoose');

const weeklyReviewSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weekStartDate: {
    type: Date,
    required: true,
  },
  weekEndDate: {
    type: Date,
    required: true,
  },
  employeeSubmission: {
    completedTasks: [{
      task: String,
      description: String,
      status: {
        type: String,
        enum: ['completed', 'partial', 'delayed'],
        default: 'completed'
      }
    }],
    challengesFaced: String,
    lessonsLearned: String,
    additionalComments: String,
    submittedAt: {
      type: Date,
      default: null
    }
  },
  managerReview: {
    feedback: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    nextWeekPlan: [{
      task: String,
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      },
      deadline: Date,
      notes: String
    }],
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'reviewed', 'approved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

weeklyReviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('WeeklyReview', weeklyReviewSchema);