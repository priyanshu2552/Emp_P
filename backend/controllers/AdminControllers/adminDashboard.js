const User = require('../../models/User');
const Leave = require('../../models/Leave');
const Expense = require('../../models/Expense')

const getAdminDashboardData = async (req, res) => {
  try {
    // Admin profile details from req.user (assuming middleware sets it)
    const adminProfile = req.user;

    // Count total users with role employee or manager
    const totalEmployees = await User.countDocuments({
      role: { $in: ['employee', 'manager'] },
    });

    const totalManagers = await User.countDocuments({ role: 'manager' });

    const pendingLeaveRequests = await Leave.countDocuments({
      status: 'pending',
    });

    const pendingExpenseRequests = await Expense.countDocuments({
      status: 'pending',
    });

    res.status(200).json({
      admin: {
        name: adminProfile.name,
        email: adminProfile.email,
        role: adminProfile.role,
      },
      stats: {
        totalEmployees,
        totalManagers,
        pendingLeaveRequests,
        pendingExpenseRequests,
      },
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getAdminDashboardData };
