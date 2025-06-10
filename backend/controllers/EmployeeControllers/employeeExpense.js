const Expense = require('../../models/Expense');
const User = require('../../models/User');
const fs = require('fs');
const path = require('path');

// Submit new expense with file upload
exports.submitExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    const userId = req.user._id;

    if (!amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Amount and description are required'
      });
    }

    let receipt = null;
    if (req.file) {
      receipt = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
    }

    const newExpense = new Expense({
      userId,
      amount,
      description,
      category: category || 'Uncategorized',
      receipt,
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

// Get all expenses for the current user with filtering
exports.getUserExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    let query = { userId };

    if (status) query.status = status;

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
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

// Download expenses as CSV
exports.downloadExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, startDate, endDate } = req.query;

    let query = { userId };
    if (status) query.status = status;

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const expenses = await Expense.find(query).sort({ createdAt: -1 });

    let csv = 'Date,Description,Category,Amount,Status,Receipt\n';
    expenses.forEach(expense => {
      csv += `"${expense.createdAt.toISOString().split('T')[0]}",` +
        `"${expense.description}",` +
        `"${expense.category}",` +
        `"${expense.amount}",` +
        `"${expense.status}",` +
        `"${expense.receiptUrl}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.status(200).end(csv);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading expenses',
      error: error.message
    });
  }
};
// View expense receipt
// View expense receipt
exports.viewReceipt = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or not authorized'
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
      'Content-Disposition': `inline; filename="${expense.receipt.filename}"`,
      'Content-Length': expense.receipt.data.length
    });

    // Send the binary data
    res.send(expense.receipt.data);

  } catch (error) {
    console.error('Error in viewReceipt:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching receipt'
    });
  }
};