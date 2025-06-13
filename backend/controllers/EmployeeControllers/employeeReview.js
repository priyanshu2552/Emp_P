const WeeklyReview = require('../../models/WeeklyReview');
const asyncHandler = require('express-async-handler');

// @desc    Get employee's weekly reviews
// @route   GET /api/employee/reviews
// @access  Private/Employee
const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await WeeklyReview.find({ employee: req.user._id })
    .populate('manager', 'name email');
  
  res.json(reviews);
});

// @desc    Submit weekly review
// @route   POST /api/employee/reviews
// @access  Private/Employee
const submitReview = asyncHandler(async (req, res) => {
  const { weekStartDate, weekEndDate, completedTasks, challengesFaced, lessonsLearned, additionalComments } = req.body;

  const existingReview = await WeeklyReview.findOne({
    employee: req.user._id,
    weekStartDate,
    weekEndDate
  });

  if (existingReview) {
    res.status(400);
    throw new Error('Weekly review already submitted for this week');
  }

  const review = new WeeklyReview({
    employee: req.user._id,
    manager: req.user.manager,
    weekStartDate,
    weekEndDate,
    employeeSubmission: {
      completedTasks,
      challengesFaced,
      lessonsLearned,
      additionalComments,
      submittedAt: Date.now()
    },
    status: 'submitted'
  });

  const createdReview = await review.save();
  res.status(201).json(createdReview);
});

module.exports = {
  getMyReviews,
  submitReview
};