const WeeklyReview = require('../../models/WeeklyReview');
const User = require('../../models/User');

// GET all weekly reviews with optional managerId filter and date sort
exports.getAllWeeklyReviews = async (req, res) => {
  try {
    const { managerId, sort } = req.query;
    const query = managerId ? { managerId } : {};

    const reviews = await WeeklyReview.find(query)
      .populate('employeeId', 'name email role')
      .populate('managerId', 'name email role')
      .sort({ weekStartDate: sort === 'asc' ? 1 : -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET user details by ID
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
