const Leave = require('../../models/Leave');
const LeaveAllocation = require('../../models/LeaveAllocation');
const User = require('../../models/User');

// Get current user's leave balance
exports.getLeaveBalance = async (req, res) => {
  try {
    const allocation = await LeaveAllocation.findOne({
      userId: req.user._id,
      year: new Date().getFullYear()
    }).populate('userId', 'name email');

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Leave allocation not found'
      });
    }

    // Format the response to match frontend expectations
    const formattedResponse = {
      casualLeaves: {
        total: allocation.casual.total,
        remaining: allocation.casual.remaining
      },
      sickLeaves: {
        total: allocation.sick.total,
        remaining: allocation.sick.remaining
      },
      vacationLeaves: {
        total: allocation.vacation.total,
        remaining: allocation.vacation.remaining
      }
    };

    res.status(200).json({
      success: true,
      data: formattedResponse
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Get current user's leave history
exports.getLeaveHistory = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const leaves = await Leave.find(filter)
      .sort({ createdAt: -1 })
      .populate('approvedBy', 'name');

    res.status(200).json({
      success: true,
      data: leaves
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Create new leave request
exports.createLeaveRequest = async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason, isHalfDay } = req.body;

    // Basic validation
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Get user's complete information
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.manager) {
      return res.status(400).json({
        success: false,
        message: 'Manager not assigned'
      });
    }

    // Check leave balance
    const allocation = await LeaveAllocation.findOne({
      userId: req.user._id,
      year: new Date().getFullYear()
    });

    if (!allocation) {
      return res.status(400).json({
        success: false,
        message: 'Leave allocation not found'
      });
    }

    const duration = isHalfDay ? 0.5 : 
      (Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1);

    if (allocation[leaveType].remaining < duration) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient leave balance'
      });
    }

    // Create leave request - MATCHING THE SCHEMA
    const leave = await Leave.create({
      userId: req.user._id, // Changed from userId to user
      startDate,
      endDate,
      leaveType,
      reason,
      isHalfDay,
      status: 'pending',
      department: user.Department || 'General', // Add department
      reportingTo: user.manager
    });

    res.status(201).json({
      success: true,
      data: leave
    });
  } catch (err) {
    console.error('Error creating leave:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};
// Cancel leave request (only if pending)
exports.cancelLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findOne({
      _id: id,
      userId: req.user._id,
      status: 'pending'
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found or cannot be cancelled'
      });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};