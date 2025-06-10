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
  TablePagination,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Stack,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Add,
  Close,
  Refresh,
  Receipt,
  Download,
  CheckCircle,
  Cancel,
  Pending,
  FilterAlt,
  CameraAlt,
  AttachFile
} from '@mui/icons-material';
import DashboardLayout from '../../components/Layout/EmployeeLayout';
import { styled } from '@mui/material/styles';

const API_BASE = 'http://localhost:5000/api/employees';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filePreview, setFilePreview] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });
  const [receiptModal, setReceiptModal] = useState({
    open: false,
    receiptUrl: '',
    receiptType: ''
  });

  const [form, setForm] = useState({
    amount: '',
    description: '',
    category: 'food',
    receiptFile: null
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const token = localStorage.getItem('token');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const res = await fetch(`${API_BASE}/expenses?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses.docs || data.expenses);
      }
    } catch (error) {
      showSnackbar('Failed to fetch expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setForm({ ...form, receiptFile: file });

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setFilePreview('pdf');
    } else {
      setFilePreview(null);
    }
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('amount', form.amount);
      formData.append('description', form.description);
      formData.append('category', form.category);
      if (form.receiptFile) {
        formData.append('receipt', form.receiptFile);
      }

      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showSnackbar('Expense submitted successfully', 'success');
        setOpenModal(false);
        setForm({ amount: '', description: '', category: 'food', receiptFile: null });
        setFilePreview(null);
        fetchExpenses();
      }
    } catch (err) {
      showSnackbar('Failed to submit expense', 'error');
    }
  };

  const handleDownload = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const res = await fetch(`${API_BASE}/expenses/download?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'expenses.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showSnackbar('Download started', 'success');
        setOpenDownloadDialog(false);
      } else {
        throw new Error('Failed to download');
      }
    } catch (error) {
      showSnackbar('Failed to download expenses', 'error');
    }
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setOpenFilterDialog(false);
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      startDate: '',
      endDate: ''
    });
    setOpenFilterDialog(false);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
  const handleViewReceipt = async (expenseId) => {
    try {
      const response = await fetch(`${API_BASE}/expenses/${expenseId}/receipt`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch receipt');
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
      showSnackbar(error.message || 'Failed to load receipt', 'error');
    }
  }
  const handleCloseReceipt = () => {
    setReceiptModal({
      open: false,
      receiptUrl: null,
      receiptType: null
    });
  };

  return (
    <DashboardLayout>
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
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Expense Claims
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FilterAlt />}
                onClick={() => setOpenFilterDialog(true)}
              >
                Filter
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => setOpenDownloadDialog(true)}
              >
                Download
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenModal(true)}
              >
                New Claim
              </Button>
            </Box>
          </Box>

          {/* Filter Dialog */}
          <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)}>
            <DialogTitle>Filter Expenses</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2, minWidth: '300px' }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  fullWidth
                />

                <TextField
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={resetFilters}>Reset</Button>
              <Button onClick={() => applyFilters(filters)} variant="contained">Apply</Button>
            </DialogActions>
          </Dialog>

          {/* Download Dialog */}
          <Dialog open={openDownloadDialog} onClose={() => setOpenDownloadDialog(false)}>
            <DialogTitle>Download Expenses</DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Choose the filters for the expenses you want to download:
              </Typography>
              <Stack spacing={3} sx={{ mt: 2, minWidth: '300px' }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  fullWidth
                />

                <TextField
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDownloadDialog(false)}>Cancel</Button>
              <Button onClick={handleDownload} variant="contained">Download</Button>
            </DialogActions>
          </Dialog>

          {/* Main Table */}
          <Card>
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
                        <TableCell sx={{ fontWeight: 600 }}>Receipt</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedExpenses.length > 0 ? (
                        paginatedExpenses.map((expense) => (
                          <TableRow key={expense._id} hover>
                            <TableCell>
                              {new Date(expense.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell sx={{ textTransform: 'capitalize' }}>
                              <Chip label={expense.category} size="small" />
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
                              {expense.receipt && (
                                <Button
                                  size="small"
                                  onClick={() => handleViewReceipt(expense._id)}
                                  startIcon={<Receipt />}
                                >
                                  View
                                </Button>
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
              outline: 'none'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">New Expense Claim</Typography>
                <IconButton onClick={() => setOpenModal(false)}>
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

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>Receipt (Optional)</Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<AttachFile />}
                    >
                      Upload File
                      <VisuallyHiddenInput
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </Button>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CameraAlt />}
                    >
                      Take Photo
                      <VisuallyHiddenInput
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                      />
                    </Button>
                  </Stack>
                  {filePreview && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={filePreview}
                        alt="Receipt preview"
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                      />
                    </Box>
                  )}
                  {form.receiptFile && !filePreview && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      File selected: {form.receiptFile.name}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" onClick={() => setOpenModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" type="submit">
                    Submit Claim
                  </Button>
                </Box>
              </form>
            </Box>
          </Modal>

          {/* Receipt View Modal */}
          <Modal open={receiptModal.open} onClose={handleCloseReceipt}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '80%', md: '70%' },
              maxWidth: '900px',
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              borderRadius: '8px',
              boxShadow: 24,
              p: 2,
              outline: 'none',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Receipt</Typography>
                <IconButton onClick={handleCloseReceipt}>
                  <Close />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2
              }}>
                {receiptModal.receiptUrl && (
                  receiptModal.receiptType?.startsWith('image/') ? (
                    <img
                      src={receiptModal.receiptUrl}
                      alt="Receipt"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '70vh',
                        objectFit: 'contain'
                      }}
                    />
                  ) : receiptModal.receiptType === 'application/pdf' ? (
                    <iframe
                      src={receiptModal.receiptUrl}
                      style={{
                        width: '100%',
                        height: '70vh',
                        border: 'none'
                      }}
                      title="Expense Receipt"
                    />
                  ) : (
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '200px'
                    }}>
                      <Typography variant="body1">
                        Preview not available. <Button
                          href={receiptModal.receiptUrl}
                          target="_blank"
                          download
                        >
                          Download File
                        </Button>
                      </Typography>
                    </Box>
                  )
                )}
              </Box>
            </Box>
          </Modal>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default ExpenseTracker;