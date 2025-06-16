const Leave = require('../../models/Leave');
const LeaveAllocation = require('../../models/LeaveAllocation');
const LeavePolicy = require('../../models/LeavePolicy');
const User = require('../../models/User');

// Get all leave requests (filterable by status)
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, Department, leaveType, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (Department) filter.Department = Department;
    if (leaveType) filter.leaveType = leaveType;

    const leaves = await Leave.find(filter)
      .populate('userId', 'name email Department')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Leave.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: leaves,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Approve/reject leave request
// In your adminLeave controller
exports.processLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    // Validate input
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"'
      });
    }

    // Find leave request with user populated
    const leave = await Leave.findById(id)
      .populate('userId', 'name email Department')
      .populate('reportingTo', 'name')
      .populate('approvedBy', 'name');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
   console.log(leave);
    // Debug logging
    console.log('Leave request found:', leave);
    console.log('User Department:', leave.userId?.Department);

    // Set Department from user if not already set on leave
    if (!leave.Department && leave.userId?.Department) {
      leave.Department = leave.userId.Department;
      console.log('Department set from user:', leave.Department);
    }

    // Validate leave status
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request has already been processed'
      });
    }

    // Update leave status
    leave.status = status;
    leave.reviewerComment = comment;
    leave.approvedBy = req.user.id;

    // If approved, deduct from allocation
    if (status === 'approved') {
      const allocation = await LeaveAllocation.findOne({
        userId: leave.userId,
        year: new Date(leave.startDate).getFullYear()
      });

      if (!allocation) {
        return res.status(400).json({
          success: false,
          message: 'Leave allocation not found for user'
        });
      }

      const duration = leave.isHalfDay ? 0.5 :
        (Math.abs(new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;

      if (allocation[leave.leaveType].remaining < duration) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient leave balance'
        });
      }

      allocation[leave.leaveType].taken += duration;
      allocation[leave.leaveType].remaining -= duration;
      await allocation.save();
    }

    // Save the updated leave
    const updatedLeave = await leave.save();

    res.status(200).json({
      success: true,
      data: updatedLeave
    });
  } catch (err) {
    console.error('Error processing leave:', err);
    res.status(500).json({
      success: false,
      message: 'Error processing leave request',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
// Get current leave policy
exports.getLeavePolicy = async (req, res) => {
  try {
    const policy = await LeavePolicy.findOne({
      year: new Date().getFullYear()
    }).sort({ year: -1 });

    if (!policy) {
      return res.status(200).json({
        success: true,
        data: {
          year: new Date().getFullYear(),
          policyName: "Default Leave Policy",
          casualLeave: { entitlement: 12, canCarryOver: false, carryOverLimit: 0 },
          sickLeave: { entitlement: 6, canCarryOver: false, carryOverLimit: 0 },
          vacationLeave: { entitlement: 15, canCarryOver: true, carryOverLimit: 5 }
        }
      });
    }

    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Update leave policy
exports.updateLeavePolicy = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const {
      policyName,
      casualLeave,
      sickLeave,
      vacationLeave,
      specialRules
    } = req.body;

    const policy = await LeavePolicy.findOneAndUpdate(
      { year: currentYear },
      {
        policyName,
        casualLeave,
        sickLeave,
        vacationLeave,
        specialRules,
        lastUpdatedBy: req.user.id
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Reset all leave allocations for new year
exports.resetYearlyAllocations = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const policy = await LeavePolicy.findOne({ year: currentYear });

    if (!policy) {
      return res.status(400).json({
        success: false,
        message: 'Leave policy not set for current year'
      });
    }

    // Get all active users
    const users = await User.find({ status: 'active' });

    // Reset allocations for each user
    const bulkOps = users.map(user => ({
      updateOne: {
        filter: { user: user._id, year: currentYear },
        update: {
          $set: {
            casual: {
              total: policy.casualLeave.entitlement,
              taken: 0,
              remaining: policy.casualLeave.entitlement
            },
            sick: {
              total: policy.sickLeave.entitlement,
              taken: 0,
              remaining: policy.sickLeave.entitlement
            },
            vacation: {
              total: policy.vacationLeave.entitlement,
              taken: 0,
              remaining: policy.vacationLeave.entitlement
            },
            carriedOver: {
              casual: 0,
              sick: 0,
              vacation: 0
            }
          }
        },
        upsert: true
      }
    }));

    await LeaveAllocation.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: `Leave allocations reset for ${users.length} users`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};