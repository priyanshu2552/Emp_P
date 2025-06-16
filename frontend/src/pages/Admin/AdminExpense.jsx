import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Select, MenuItem, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton, TablePagination,
  Snackbar, Alert, Avatar, Chip
} from '@mui/material';
import { Check as ApproveIcon, Close as RejectIcon, Visibility as ViewIcon } from '@mui/icons-material';
import axios from 'axios';

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [receiptModal, setReceiptModal] = useState({
    open: false,
    receiptUrl: null,
    receiptType: null,
    filename: 'receipt'
  });

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
      showSnackbar('Failed to fetch expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = async (expenseId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/expenses/${expenseId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const contentType = response.headers['content-type'];
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'receipt';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) filename = filenameMatch[1];
      }

      const url = URL.createObjectURL(response.data);

      setReceiptModal({
        open: true,
        receiptUrl: url,
        receiptType: contentType,
        filename: filename
      });
    } catch (error) {
      console.error('Error loading receipt:', error);
      showSnackbar('Error loading receipt', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/expenses/${id}`,
        { status, comments: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSnackbar(`Expense ${status} successfully`);
      setComment('');
      setSelectedExpenseId(null);
      setOpenDialog(false);
      fetchExpenses();
    } catch (err) {
      console.error('Failed to update expense status', err);
      showSnackbar('Failed to update expense status', 'error');
    }
  };

  const openActionDialog = (expenseId, type) => {
    setSelectedExpenseId(expenseId);
    setActionType(type);
    setOpenDialog(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchExpenses();
  }, [statusFilter]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Expense Management</Typography>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </Box>

      {loading ? (
        <Typography>Loading expenses...</Typography>
      ) : (
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5', height: '40px' }}>
                  <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Employee</TableCell>
                  <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Receipt</TableCell>
                  <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Comments</TableCell>
                  <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 2 }}>
                      No expenses found
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((expense) => (
                    <TableRow key={expense._id} hover sx={{ height: '48px' }}>
                      <TableCell sx={{ py: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24 }}>
                            {expense.userId?.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Typography variant="body2">
                            {expense.userId?.name || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>${expense.amount}</TableCell>
                      <TableCell sx={{ 
                        maxWidth: 200,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        py: 0.5
                      }}>
                        {expense.description}
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <Chip label={expense.category} size="small" />
                      </TableCell>
                      <TableCell sx={{ 
                        py: 0.5,
                        color: expense.status === 'approved' ? 'green' : 
                              expense.status === 'rejected' ? 'red' : 'inherit'
                      }}>
                        {expense.status}
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        {(expense.receipt || expense.receiptUrl) && (
                          <IconButton
                            size="small"
                            onClick={() => handleViewReceipt(expense._id)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell sx={{ 
                        maxWidth: 200,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        py: 0.5
                      }}>
                        {expense.comments}
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        {expense.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() => openActionDialog(expense._id, 'approve')}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => openActionDialog(expense._id, 'reject')}
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={expenses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Expense' : 'Reject Expense'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Comment"
            fullWidth
            margin="dense"
            size="small"
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} size="small">Cancel</Button>
          <Button
            onClick={() => handleStatusUpdate(selectedExpenseId, actionType === 'approve' ? 'approved' : 'rejected')}
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
            size="small"
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog
        open={receiptModal.open}
        onClose={() => setReceiptModal({...receiptModal, open: false})}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Expense Receipt</DialogTitle>
        <DialogContent>
          {receiptModal.receiptUrl ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              {receiptModal.receiptType.includes('image') ? (
                <img
                  src={receiptModal.receiptUrl}
                  alt="Receipt"
                  style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                />
              ) : (
                <Button
                  variant="contained"
                  href={receiptModal.receiptUrl}
                  download={receiptModal.filename}
                >
                  Download Receipt
                </Button>
              )}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ my: 4 }}>
              No receipt available
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptModal({...receiptModal, open: false})}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminExpenses;