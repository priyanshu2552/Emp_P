const WeeklyReview = require('../../models/WeeklyReview');

exports.getEmployeeReviews = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const reviews = await WeeklyReview.find({ employeeId })
      .populate('managerId', 'name email')
      .sort({ weekStartDate: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};
