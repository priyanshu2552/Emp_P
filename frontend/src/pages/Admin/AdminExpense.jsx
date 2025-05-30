import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Select, MenuItem, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import axios from 'axios';

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/admin/expenses${statusFilter ? `?status=${statusFilter}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data.expenses);
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/expenses/${id}`, { status, comments: comment }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComment('');
      setSelectedExpenseId(null);
      fetchExpenses();
    } catch (err) {
      console.error('Failed to update expense status', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [statusFilter]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Manage Expenses</Typography>

      <Box mb={3}>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell>{expense.userId.name}</TableCell>
                  <TableCell>{expense.amount}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.status}</TableCell>
                  <TableCell>{expense.comments}</TableCell>
                  <TableCell>
                    {expense.status === 'pending' && (
                      <>
                        <TextField
                          label="Comment"
                          value={selectedExpenseId === expense._id ? comment : ''}
                          onChange={(e) => {
                            setSelectedExpenseId(expense._id);
                            setComment(e.target.value);
                          }}
                          size="small"
                        />
                        <Button onClick={() => handleStatusUpdate(expense._id, 'approved')}>Approve</Button>
                        <Button onClick={() => handleStatusUpdate(expense._id, 'rejected')}>Reject</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminExpenses;
