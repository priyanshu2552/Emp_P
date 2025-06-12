const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        return !this.endDate || value <= this.endDate;
      },
      message: 'Start date must be before end date'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  leaveType: {
    type: String,
    enum: ['casual', 'sick', 'vacation'],
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isHalfDay: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewerComment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  reportingTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    
  },
  department: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for duration in days
leaveSchema.virtual('duration').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return this.isHalfDay ? 0.5 : duration;
});

// Indexes for better query performance
leaveSchema.index({ userId: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1 });
leaveSchema.index({ endDate: 1 });
leaveSchema.index({ leaveType: 1 });
leaveSchema.index({ department: 1 });

module.exports = mongoose.model('Leave', leaveSchema);