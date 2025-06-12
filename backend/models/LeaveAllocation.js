const mongoose = require('mongoose');

const leaveAllocationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    validate: {
      validator: (v) => mongoose.Types.ObjectId.isValid(v),
      message: props => `${props.value} is not a valid user ID!`
    }
  },
  year: {
    type: Number,
    required: true,
    default: new Date().getFullYear()
  },
  casual: {
    total: { type: Number, default: 12, min: 0 },
    taken: { type: Number, default: 0, min: 0 },
    remaining: { type: Number, default: 12, min: 0 }
  },
  sick: {
    total: { type: Number, default: 6, min: 0 },
    taken: { type: Number, default: 0, min: 0 },
    remaining: { type: Number, default: 6, min: 0 }
  },
  vacation: {
    total: { type: Number, default: 15, min: 0 },
    taken: { type: Number, default: 0, min: 0 },
    remaining: { type: Number, default: 15, min: 0 }
  },
  carriedOver: {
    casual: { type: Number, default: 0, min: 0 },
    sick: { type: Number, default: 0, min: 0 },
    vacation: { type: Number, default: 0, min: 0 }
  }
}, {
  timestamps: true
});

// Pre-save hook to calculate remaining leaves
leaveAllocationSchema.pre('save', function (next) {
  this.casual.remaining = (this.casual.total || 0) - (this.casual.taken || 0) + (this.carriedOver.casual || 0);
  this.sick.remaining = (this.sick.total || 0) - (this.sick.taken || 0) + (this.carriedOver.sick || 0);
  this.vacation.remaining = (this.vacation.total || 0) - (this.vacation.taken || 0) + (this.carriedOver.vacation || 0);
  next();
});

// Compound index to ensure one allocation per user per year
leaveAllocationSchema.index({ userId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveAllocation', leaveAllocationSchema);