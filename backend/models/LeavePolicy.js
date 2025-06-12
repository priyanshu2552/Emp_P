const mongoose = require('mongoose');

const leavePolicySchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    unique: true
  },
  policyName: {
    type: String,
    required: true,
    default: 'Default Leave Policy'
  },
  casualLeave: {
    entitlement: { type: Number, default: 12, min: 0 },
    canCarryOver: { type: Boolean, default: false },
    carryOverLimit: { type: Number, default: 0, min: 0 },
    requiresApproval: { type: Boolean, default: true }
  },
  sickLeave: {
    entitlement: { type: Number, default: 6, min: 0 },
    canCarryOver: { type: Boolean, default: false },
    carryOverLimit: { type: Number, default: 0, min: 0 },
    requiresDocumentation: { type: Boolean, default: false }
  },
  vacationLeave: {
    entitlement: { type: Number, default: 15, min: 0 },
    canCarryOver: { type: Boolean, default: true },
    carryOverLimit: { type: Number, default: 5, min: 0 },
    minNoticePeriod: { type: Number, default: 7, min: 0 } // days
  },
  specialRules: [{
    description: String,
    condition: String,
    effect: String
  }],
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeavePolicy', leavePolicySchema);