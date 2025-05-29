const WeeklyReview = require('../../models/WeeklyReview');
const User = require('../../models/User');

// Get employees of a manager
exports.getEmployeesForManager = async (req, res) => {
  try {
    const managerId = req.user.id;
    const employees = await User.find({ manager: managerId }).select('-password');
    res.json({ success: true, employees });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch employees' });
  }
};

exports.getEmployeeDetailsById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch employee details' });
  }
};
// Submit a weekly review
exports.submitReview = async (req, res) => {
  try {
    const { employeeId, weekStartDate, weekEndDate, accomplishments, feedback, rating } = req.body;

    const review = new WeeklyReview({
      employeeId,
      managerId: req.user.id,
      weekStartDate,
      weekEndDate,
      accomplishments,
      feedback,
      rating,
    });

    await review.save();
    res.json({ success: true, message: 'Review submitted', review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
};

// Get previous reviews written by the manager
exports.getManagerReviews = async (req, res) => {
  try {
    const reviews = await WeeklyReview.find({ managerId: req.user.id })
      .populate('employeeId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};
