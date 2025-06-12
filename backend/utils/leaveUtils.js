const LeaveAllocation = require('../models/LeaveAllocation');

// Check if leave is available
exports.checkLeaveAvailability = (leaveAllocation, leaveType, duration) => {
  if (!leaveAllocation) return false;
  
  const allocation = leaveAllocation[`${leaveType}Leaves`];
  return allocation && allocation.remaining >= duration;
};

// Reset leaves at the start of new year
exports.resetYearlyLeaves = async () => {
  await LeaveAllocation.resetYearlyLeaves();
};

// Adjust leaves at mid-year
exports.adjustMidYearLeaves = async () => {
  await LeaveAllocation.adjustMidYearLeaves();
};