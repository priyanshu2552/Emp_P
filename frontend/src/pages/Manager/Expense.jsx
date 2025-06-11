import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Select, MenuItem, Dialog, DialogTitle, 
  DialogContent, DialogActions, Chip, CircularProgress, TablePagination, Avatar,IconButton
} from '@mui/material';
import {
  CheckCircle, Cancel, Pending, Refresh, Comment, Visibility, Download,
} from '@mui/icons-material';
import ManagerLayout from '../../components/Layout/ManagerLayout';
import { format } from 'date-fns';

const API_BASE = 'http://localhost:5000/api/manager';

const ManagerExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [action, setAction] = useState('');
  const [comment, setComment] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [receiptModal, setReceiptModal] = useState({
    open: false,
    receiptUrl: null,
    receiptType: null,
    filename: 'receipt'
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const token = localStorage.getItem('token');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/expenses/team`;
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses.docs || data.expenses);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [statusFilter]);

  const handleReview = (expense, action) => {
    setSelectedExpense(expense);
    setAction(action);
    setReviewModalOpen(true);
  };

  const submitReview = async () => {
    try {
      const res = await fetch(`${API_BASE}/expenses/review/${selectedExpense._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: action,
          comments: comment
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewModalOpen(false);
        setComment('');
        fetchExpenses();
      }
    } catch (err) {
      console.error('Failed to review expense:', err);
    }
  };

  const handleViewReceipt = async (expenseId) => {
  try {
    const response = await fetch(`${API_BASE}/expenses/${expenseId}/receipt`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch receipt');
    }

    const contentType = response.headers.get('content-type');
    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'receipt';

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) filename = filenameMatch[1];
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    setReceiptModal({
      open: true,
      receiptUrl: url,
      receiptType: contentType,
      filename: filename
    });

  } catch (error) {
    console.error('Error loading receipt:', error);
    // You might want to add a snackbar/notification here
  }
};

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle color="success" />;
      case 'rejected': return <Cancel color="error" />;
      default: return <Pending color="warning" />;
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredExpenses = expenses.filter(expense => {
    if (statusFilter === 'all') return true;
    return expense.status === statusFilter;
  });

  const paginatedExpenses = filteredExpenses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <ManagerLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Team Expense Approvals</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchExpenses}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        <Card>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Receipt</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : paginatedExpenses.length > 0 ? (
                  paginatedExpenses.map((expense) => (
                    <TableRow key={expense._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {expense.userId?.firstName?.charAt(0)}{expense.userId?.lastName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {expense.userId?.firstName} {expense.userId?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {expense.userId?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {format(new Date(expense.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{expense.description}</Typography>
                        {expense.comments && (
                          <Typography variant="caption" color="text.secondary">
                            <Comment fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            {expense.comments}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>${expense.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={expense.category}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {getStatusIcon(expense.status)}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {expense.status}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {(expense.receiptUrl || expense.receipt) && (
                          <IconButton onClick={() => handleViewReceipt(expense._id)} size="small">
                            <Visibility color="primary" />
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell>
                        {expense.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleReview(expense, 'approved')}
                              startIcon={<CheckCircle />}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleReview(expense, 'rejected')}
                              startIcon={<Cancel />}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No expenses found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredExpenses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>

        {/* Review Modal */}
        <Dialog open={reviewModalOpen} onClose={() => setReviewModalOpen(false)}>
          <DialogTitle>
            {action === 'approved' ? 'Approve Expense' : 'Reject Expense'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You are about to {action} this expense claim by {selectedExpense?.userId?.firstName} {selectedExpense?.userId?.lastName}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Amount:</strong> ${selectedExpense?.amount?.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Description:</strong> {selectedExpense?.description}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Category:</strong> {selectedExpense?.category}
            </Typography>
            <TextField
              fullWidth
              label="Comments (Optional)"
              multiline
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any additional comments for the employee"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewModalOpen(false)}>Cancel</Button>
            <Button
              onClick={submitReview}
              color={action === 'approved' ? 'success' : 'error'}
              variant="contained"
            >
              {action === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
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
          <DialogTitle>
            Receipt for {selectedExpense?.description}
          </DialogTitle>
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
                    startIcon={<Download />}
                    href={receiptModal.receiptUrl}
                    download={receiptModal.filename}
                  >
                    Download Receipt
                  </Button>
                )}
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ my: 4 }}>
                No receipt available for this expense
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReceiptModal({...receiptModal, open: false})}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ManagerLayout>
  );
};

export default ManagerExpenseTracker;