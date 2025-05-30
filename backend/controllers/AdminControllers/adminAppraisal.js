const Appraisal = require('../../models/Appraisal');
const User = require('../../models/User');

// Get all appraisals with optional filter by manager
exports.getAllAppraisals = async (req, res) => {
  try {
    const { managerId } = req.query;
    const filter = managerId ? { managerId } : {};

    const appraisals = await Appraisal.find(filter)
      .populate('userId', 'name email role')
      .populate('managerId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ appraisals });
  } catch (error) {
    console.error('Error fetching appraisals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user (manager or employee) details
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
