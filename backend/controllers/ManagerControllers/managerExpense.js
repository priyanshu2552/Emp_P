const Expense = require('../../models/Expense');
const User = require('../../models/User');

// Get all expenses for employees under the current manager
exports.getTeamExpenses = async (req, res) => {
  try {
    const managerId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    // Find all employees who report to this manager
    const teamMembers = await User.find({ manager: managerId }, '_id');
    const teamMemberIds = teamMembers.map(member => member._id);

    let query = { userId: { $in: teamMemberIds } };

    // Optional status filter
    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    };

    const expenses = await Expense.paginate(query, options);

    res.status(200).json({
      success: true,
      expenses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team expenses',
      error: error.message
    });
  }
};

// Approve or reject an expense
exports.reviewExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { status, comments } = req.body;
    const managerId = req.user._id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"'
      });
    }

    // Verify the expense belongs to a team member of this manager
    const expense = await Expense.findById(expenseId).populate('userId');
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const employee = await User.findById(expense.userId);
    if (!employee || !employee.manager || !employee.manager.equals(managerId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this expense'
      });
    }

    // Update the expense
    expense.status = status;
    expense.comments = comments || '';
    expense.reviewedBy = managerId;
    expense.reviewedAt = new Date();

    await expense.save();

    res.status(200).json({
      success: true,
      message: `Expense ${status} successfully`,
      expense
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reviewing expense',
      error: error.message
    });
  }
};

// Get expense receipt - updated to match employee implementation
exports.getExpenseReceipt = async (req, res) => {
  try {
    const { expenseId } = req.params;
    console.log(expenseId);
    const managerId = req.user._id;

    // Verify the expense belongs to a team member of this manager
    const expense = await Expense.findById(expenseId).populate('userId');
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const employee = await User.findById(expense.userId);
    if (!employee || !employee.manager || !employee.manager.equals(managerId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this receipt'
      });
    }

    if (!expense.receipt || !expense.receipt.data) {
      return res.status(404).json({
        success: false,
        message: 'No receipt found for this expense'
      });
    }

    // Set appropriate headers
    res.set({
      'Content-Type': expense.receipt.contentType,
      'Content-Disposition': `inline; filename="${expense.receipt.filename || 'receipt'}"`,
      'Content-Length': expense.receipt.data.length
    });

    // Send the binary data
    res.send(expense.receipt.data);

  } catch (error) {
    console.error('Error in getExpenseReceipt:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching receipt'
    });
  }
};