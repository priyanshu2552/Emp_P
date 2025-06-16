const Expense = require('../../models/Expense');

// Fetch expenses with optional status filter
exports.getExpenses = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const expenses = await Expense.find(filter).populate('userId', 'name email role');
        res.status(200).json({ success: true, expenses });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update expense status with comments
exports.updateExpenseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comments } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        expense.status = status;
        expense.comments = comments; // make sure you're passing 'comments' not 'comment'
        expense.reviewedAt = new Date();
        await expense.save();

        res.status(200).json({ success: true, message: 'Expense updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getExpenseReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findById(id);
        
        if (!expense) {
            return res.status(404).json({ 
                success: false, 
                message: 'Expense not found' 
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
