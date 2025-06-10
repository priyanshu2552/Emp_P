const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  receipt: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  comments: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

expenseSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Expense', expenseSchema);