import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  Modal,
  Divider,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
  TablePagination
} from '@mui/material';
import { Add, Close, Refresh, Receipt, Download, CheckCircle, Cancel, Pending, KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
// import DashboardLayout from '../../components/Layout/EmployeeLayout';
import ManagerLayout from '../../components/Layout/ManagerLayout';

const API_BASE = 'http://localhost:5000/api/manager';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    description: '',
    category: 'food',
    receiptUrl: ''
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const token = localStorage.getItem('token');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/expenses`, {
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setOpenModal(false);
        setForm({ amount: '', description: '', category: 'food', receiptUrl: '' });
        fetchExpenses();
      }
    } catch (err) {
      console.error('Failed to submit expense:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle color="success" sx={{ fontSize: '1rem', mr: 0.5 }} />;
      case 'rejected': return <Cancel color="error" sx={{ fontSize: '1rem', mr: 0.5 }} />;
      default: return <Pending color="warning" sx={{ fontSize: '1rem', mr: 0.5 }} />;
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated expenses
  const paginatedExpenses = expenses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <ManagerLayout>
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        minHeight: 'calc(100vh - 64px)',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto'
        }}>
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              fontSize: '1.1rem'
            }}>
              Expense Claims
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchExpenses}
                sx={{ 
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenModal(true)}
                sx={{ 
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  }
                }}
              >
                New Claim
              </Button>
            </Box>
          </Box>

          {/* Summary Cards */}
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            mb: 4, 
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}>
            <Paper sx={{ 
              p: 3, 
              flex: 1, 
              minWidth: '200px', 
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              '&:hover': {
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }
            }}>
              <Typography variant="subtitle2" color="text.secondary">Total Claims</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{expenses.length}</Typography>
            </Paper>
            <Paper sx={{ 
              p: 3, 
              flex: 1, 
              minWidth: '200px', 
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              '&:hover': {
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }
            }}>
              <Typography variant="subtitle2" color="text.secondary">Pending</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {expenses.filter(e => e.status === 'pending').length}
              </Typography>
            </Paper>
            <Paper sx={{ 
              p: 3, 
              flex: 1, 
              minWidth: '200px', 
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              '&:hover': {
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }
            }}>
              <Typography variant="subtitle2" color="text.secondary">Approved</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {expenses.filter(e => e.status === 'approved').length}
              </Typography>
            </Paper>
          </Box>

          {/* Main Table */}
          <Card sx={{ 
            borderRadius: '8px', 
            boxShadow: 'none', 
            border: '1px solid #e0e0e0',
            '&:hover': {
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            }
          }}>
            <Box sx={{ 
              p: 2,
              borderBottom: '1px solid #f0f0f0'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Recent Expense Claims
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Showing {paginatedExpenses.length} of {expenses.length} entries
              </Typography>
            </Box>
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#fafafa' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedExpenses.length > 0 ? (
                        paginatedExpenses.map((expense) => (
                          <TableRow 
                            key={expense._id} 
                            hover
                            sx={{ 
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              }
                            }}
                          >
                            <TableCell>
                              {new Date(expense.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell sx={{ textTransform: 'capitalize' }}>
                              <Chip 
                                label={expense.category} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: '#e3f2fd',
                                  color: '#1976d2',
                                  '&:hover': {
                                    backgroundColor: '#bbdefb',
                                  }
                                }} 
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>
                              ₹{parseFloat(expense.amount).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: 
                                  expense.status === 'approved' ? 'success.main' :
                                  expense.status === 'rejected' ? 'error.main' :
                                  'warning.main'
                              }}>
                                {getStatusIcon(expense.status)}
                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                  {expense.status}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {expense.receiptUrl && (
                                <IconButton 
                                  size="small" 
                                  href={expense.receiptUrl} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ 
                                    color: 'primary.main',
                                    '&:hover': {
                                      backgroundColor: 'primary.light',
                                      color: 'primary.dark'
                                    }
                                  }}
                                >
                                  <Download fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No expense claims found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {expenses.length > 5 && (
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={expenses.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      sx={{
                        borderTop: '1px solid #f0f0f0',
                        '& .MuiTablePagination-toolbar': {
                          padding: '0 16px'
                        }
                      }}
                      nextIconButtonProps={{
                        sx: {
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }
                      }}
                      backIconButtonProps={{
                        sx: {
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }
                      }}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Add Expense Modal */}
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '500px' },
              bgcolor: 'background.paper',
              borderRadius: '8px',
              boxShadow: 24,
              p: 3,
              outline: 'none',
              border: '1px solid #e0e0e0'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  New Expense Claim
                </Typography>
                <IconButton 
                  onClick={() => setOpenModal(false)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <Close />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                  }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
                <Select
                  fullWidth
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="food">Food & Beverage</MenuItem>
                  <MenuItem value="travel">Travel</MenuItem>
                  <MenuItem value="office">Office Supplies</MenuItem>
                  <MenuItem value="transportation">Transportation</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                <TextField
                  fullWidth
                  label="Receipt URL (Optional)"
                  name="receiptUrl"
                  value={form.receiptUrl}
                  onChange={handleChange}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <Receipt sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                />
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: 2 
                }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setOpenModal(false)}
                    sx={{ 
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    type="submit"
                    sx={{ 
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      }
                    }}
                  >
                    Submit Claim
                  </Button>
                </Box>
              </form>
            </Box>
          </Modal>
        </Box>
      </Box>
    </ManagerLayout>
  );
};

export default ExpenseTracker;