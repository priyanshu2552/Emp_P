const Leave = require('../../models/Leave');
const User = require('../../models/User');
const LeaveAllocation = require('../../models/LeaveAllocation');
const { differenceInDays } = require('date-fns');

// Get manager's own leaves (needs admin approval)
exports.getManagerLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user._id })
      .populate('userId', 'name email image')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching manager leaves',
      error: error.message
    });
  }
};

// Get team leaves for approval
exports.getTeamLeaves = async (req, res) => {
  try {
    // Find all users who report to this manager
    const teamMembers = await User.find({ manager: req.user._id }, '_id');
    const teamMemberIds = teamMembers.map(member => member._id);

    const leaves = await Leave.find({
      userId: { $in: teamMemberIds },
      status: 'pending'
    })
      .populate('userId', 'name email image')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team leaves',
      error: error.message
    });
  }
};

// Get manager's leave allocation
exports.getManagerLeaveAllocation = async (req, res) => {
  try {
    const allocation = await LeaveAllocation.findOne({ userId: req.user._id });
    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Leave allocation not found'
      });
    }

    res.status(200).json({ success: true, allocation });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leave allocation',
      error: error.message
    });
  }
};

// Manager applies for leave (needs admin approval)
exports.createManagerLeave = async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason, isHalfDay } = req.body;

    // Validate required fields
    if (!startDate || !endDate || !leaveType || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Check leave availability
    const duration = isHalfDay ? 0.5 : (differenceInDays(end, start) + 1);
    const leaveAllocation = await LeaveAllocation.findOne({ userId: req.user._id });

    if (!leaveAllocation) {
      return res.status(400).json({
        success: false,
        message: 'Leave allocation not found'
      });
    }

    if (leaveAllocation[leaveType].remaining < duration) {
      return res.status(400).json({
        success: false,
        message: `Not enough ${leaveType} leaves remaining`
      });
    }

    // Find admin to approve manager's leave
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'No admin found to approve leave'
      });
    }
    
    const newLeave = new Leave({
      userId: req.user._id,
      startDate: start,
      endDate: end,
      leaveType,
      reason,
      isHalfDay,
      status: 'pending',
      reportingTo: admin._id,
      department: req.user.Department
    });
    console.log(newLeave);
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

// Manager approves/rejects team member leave
exports.reviewTeamLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { action, comment } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    const leave = await Leave.findById(leaveId).populate('userId');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    // Verify the manager is the reporting manager for this leave
    const teamMember = await User.findOne({ 
      _id: leave.userId._id, 
      manager: req.user._id 
    });

    if (!teamMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this leave'
      });
    }

    // Update leave status
    leave.status = action === 'approve' ? 'approved' : 'rejected';
    leave.reviewerComment = comment;
    leave.approvedBy = req.user._id;

    // If approved, update leave allocation
    if (action === 'approve') {
      const duration = leave.isHalfDay ? 0.5 : (differenceInDays(leave.endDate, leave.startDate) + 1);
      const allocation = await LeaveAllocation.findOne({ userId: leave.userId._id });

      if (allocation) {
        allocation[leave.leaveType].taken += duration;
        allocation[leave.leaveType].remaining = 
          allocation[leave.leaveType].total - allocation[leave.leaveType].taken;
        await allocation.save();
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
      message: 'Error reviewing leave',
      error: error.message
    });
  }
};