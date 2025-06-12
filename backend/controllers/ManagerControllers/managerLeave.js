const Leave = require('../../models/Leave');
const User = require('../../models/User');
const LeaveAllocation = require('../../models/LeaveAllocation');
const { checkLeaveAvailability } = require('../../utils/leaveUtils');

// Submit leave (manager's own leave - needs admin approval)
exports.submitLeave = async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason } = req.body;
    const userId = req.user._id;

    if (!startDate || !endDate || !leaveType || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const leaveAllocation = await LeaveAllocation.findOne({ userId });
    if (!leaveAllocation) {
      return res.status(400).json({
        success: false,
        message: 'Leave allocation not found for user'
      });
    }

    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const isAvailable = await checkLeaveAvailability(leaveAllocation, leaveType, duration);

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: `Not enough ${leaveType} leaves remaining`
      });
    }

    const newLeave = new Leave({
      userId,
      startDate: start,
      endDate: end,
      leaveType,
      reason,
      status: 'pending', // Manager's leaves need admin approval
      reportingTo: req.user.reportingTo // Set admin as approver for manager's leaves
    });

    await newLeave.save();

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully (Pending admin approval)',
      leave: newLeave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting leave request',
      error: error.message
    });
  }
};

// Get manager's own leaves
exports.getUserLeaves = async (req, res) => {
  try {
    const userId = req.user._id;
    const leaves = await Leave.find({ userId })
      .sort({ createdAt: -1 })
      .populate('approvedBy', 'name');

    const leaveAllocation = await LeaveAllocation.findOne({ userId });

    res.status(200).json({
      success: true,
      leaves,
      leaveAllocation: leaveAllocation || {
        casualLeaves: { total: 0, taken: 0, remaining: 0 },
        sickLeaves: { total: 0, taken: 0, remaining: 0 },
        vacationLeaves: { total: 0, taken: 0, remaining: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leave requests',
      error: error.message
    });
  }
};

// Get team leaves (for approval)
exports.getTeamLeaves = async (req, res) => {
  try {
    const managerId = req.user._id;
    
    // Find all employees who report to this manager
    const teamMembers = await User.find({ manager: managerId }, '_id');
    const teamMemberIds = teamMembers.map(member => member._id);

    const leaves = await Leave.find({ 
      userId: { $in: teamMemberIds },
      status: 'pending'
    })
    .populate('userId', 'name email image')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team leave requests',
      error: error.message
    });
  }
};

// Approve/reject team member leave
exports.reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comment } = req.body;
    const reviewerId = req.user._id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    const leave = await Leave.findById(id).populate('userId');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    // Check if the reviewer is the manager of the employee
    const employee = await User.findById(leave.userId._id);
    if (!employee.manager || !employee.manager.equals(reviewerId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this leave'
      });
    }

    // Update leave status
    leave.status = action === 'approve' ? 'approved' : 'rejected';
    leave.supervisorComment = comment;
    leave.approvedBy = reviewerId;

    // If approved, update leave allocation
    if (action === 'approve') {
      const leaveAllocation = await LeaveAllocation.findOne({ userId: leave.userId._id });
      if (leaveAllocation) {
        const duration = Math.ceil((leave.endDate - leave.startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        switch (leave.leaveType) {
          case 'casual':
            leaveAllocation.casualLeaves.taken += duration;
            leaveAllocation.casualLeaves.remaining = leaveAllocation.casualLeaves.total - leaveAllocation.casualLeaves.taken;
            break;
          case 'sick':
            leaveAllocation.sickLeaves.taken += duration;
            leaveAllocation.sickLeaves.remaining = leaveAllocation.sickLeaves.total - leaveAllocation.sickLeaves.taken;
            break;
          case 'vacation':
            leaveAllocation.vacationLeaves.taken += duration;
            leaveAllocation.vacationLeaves.remaining = leaveAllocation.vacationLeaves.total - leaveAllocation.vacationLeaves.taken;
            break;
        }
        
        await leaveAllocation.save();
      }
    }

    await leave.save();

    res.status(200).json({
      success: true,
      message: `Leave ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reviewing leave request',
      error: error.message
    });
  }
};

// Get leave allocation for manager
exports.getLeaveAllocation = async (req, res) => {
  try {
    const userId = req.user._id;
    const leaveAllocation = await LeaveAllocation.findOne({ userId });

    if (!leaveAllocation) {
      return res.status(200).json({
        success: true,
        allocation: {
          casualLeaves: { total: 0, taken: 0, remaining: 0 },
          sickLeaves: { total: 0, taken: 0, remaining: 0 },
          vacationLeaves: { total: 0, taken: 0, remaining: 0 }
        }
      });
    }

    res.status(200).json({
      success: true,
      allocation: leaveAllocation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leave allocation',
      error: error.message
    });
  }
};