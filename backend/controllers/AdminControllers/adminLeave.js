const Leave = require('../../models/Leave');
const User = require('../../models/User');

exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate('userId', 'name email');
    res.status(200).json({ success: true, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status, SupervisorComment } = req.body;

  try {
    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    leave.status = status;
    leave.SupervisorComment = SupervisorComment;
    leave.approvedBy = req.user._id;
    await leave.save();

    res.status(200).json({ success: true, message: 'Leave updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
