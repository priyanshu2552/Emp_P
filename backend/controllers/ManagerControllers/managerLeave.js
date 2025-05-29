const Leave = require('../../models/Leave');

// Submit a new leave request
exports.submitLeave = async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason } = req.body;
    const userId = req.user._id;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Start date, end date, and reason are required',
      });
    }

    const newLeave = new Leave({
      userId,
      startDate,
      endDate,
      leaveType: leaveType || 'Unspecified',
      reason,
    });

    await newLeave.save();

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      leave: newLeave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting leave request',
      error: error.message,
    });
  }
};

// Get all leave requests for the current user
exports.getUserLeaves = async (req, res) => {
  try {
    const userId = req.user._id;

    const leaves = await Leave.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leave requests',
      error: error.message,
    });
  }
};
