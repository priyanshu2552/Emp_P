const WeeklyReview = require('../../models/WeeklyReview');
const User = require('../../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get reviews assigned to manager
// @route   GET /api/manager/reviews
// @access  Private/Manager
const getAssignedReviews = asyncHandler(async (req, res) => {
  const reviews = await WeeklyReview.find({ manager: req.user._id, status: 'submitted' })
    .populate('employee', 'name email EmployeeId Department');
  
  res.json(reviews);
});

// @desc    Submit manager review
// @route   PUT /api/manager/reviews/:id
// @access  Private/Manager
const submitManagerReview = asyncHandler(async (req, res) => {
  const { feedback, rating, nextWeekPlan } = req.body;

  const review = await WeeklyReview.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.manager.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to review this');
  }

  review.managerReview = {
    feedback,
    rating,
    nextWeekPlan,
    reviewedAt: Date.now()
  };
  review.status = 'reviewed';

  const updatedReview = await review.save();
  res.json(updatedReview);
});

// @desc    Get manager's team members
// @route   GET /api/manager/team
// @access  Private/Manager
const getTeamMembers = asyncHandler(async (req, res) => {
  const team = await User.find({ manager: req.user._id }, 'name email EmployeeId Department');
  res.json(team);
});


module.exports = {
  getAssignedReviews,
  submitManagerReview,
  getTeamMembers
};