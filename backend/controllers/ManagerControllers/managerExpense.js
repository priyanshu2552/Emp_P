const Expense = require('../../models/Expense');
const User = require('../../models/User');

// Submit new expense
exports.submitExpense = async (req, res) => {
  try {
    const { amount, description, category, receiptUrl } = req.body;
    const userId = req.user._id;

    // Basic validation
    if (!amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Amount and description are required'
      });
    }

    const newExpense = new Expense({
      userId,
      amount,
      description,
      category: category || 'Uncategorized',
      receiptUrl: receiptUrl || '',
      status: 'pending'
    });

    await newExpense.save();

    res.status(201).json({
      success: true,
      message: 'Expense submitted successfully',
      expense: newExpense
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting expense',
      error: error.message
    });
  }
};

// Get all expenses for the current user
exports.getUserExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = { userId };

    // Optional status filter
    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const expenses = await Expense.paginate(query, options);

    res.status(200).json({
      success: true,
      expenses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
};