const WeeklyReview = require('../../models/WeeklyReview');
const User = require('../../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all weekly reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await WeeklyReview.find()
    .populate('employee', 'name email EmployeeId Department')
    .populate('manager', 'name email');
  
  res.json(reviews);
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, '-password');
  res.json(users);
});

// @desc    Get overview statistics
// @route   GET /api/admin/overview
// @access  Private/Admin
const getOverview = asyncHandler(async (req, res) => {
  const totalEmployees = await User.countDocuments({ role: 'employee' });
  const totalManagers = await User.countDocuments({ role: 'manager' });
  const pendingReviews = await WeeklyReview.countDocuments({ status: 'pending' });
  const submittedReviews = await WeeklyReview.countDocuments({ status: 'submitted' });
  const reviewedReviews = await WeeklyReview.countDocuments({ status: 'reviewed' });

  res.json({
    totalEmployees,
    totalManagers,
    pendingReviews,
    submittedReviews,
    reviewedReviews
  });
});

module.exports = {
  getAllReviews,
  getAllUsers,
  getOverview
};