import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TablePagination,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import { Search, Close, Visibility } from '@mui/icons-material';
import axios from 'axios';

const WeeklyReviewAdminPage = () => {
  const [reviews, setReviews] = useState([]);
  const [managerFilter, setManagerFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const token = localStorage.getItem('token');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const url = 'http://localhost:5000/api/admin/weekly-reviews';
      const response = await axios.get(url, {
        params: { 
          managerId: managerFilter, 
          sort: sortOrder 
        },
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      setReviews(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error:', err);
      setError(`Failed to fetch reviews: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (userId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:5000/api/admin/weekly-reviews/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedUser(data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [managerFilter, sortOrder]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Weekly Reviews Dashboard</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={fetchReviews}
          startIcon={<Search />}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
          {error}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Filter by Manager ID"
          variant="outlined"
          size="small"
          value={managerFilter}
          onChange={(e) => setManagerFilter(e.target.value)}
          placeholder="Enter manager ID"
        />
        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="desc">Newest First</MenuItem>
          <MenuItem value="asc">Oldest First</MenuItem>
        </Select>
      </Box>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5', height: '40px' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Manager</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Week</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Feedback</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                reviews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((review) => (
                  <TableRow key={review._id} hover>
                    <TableCell>
                      <Typography 
                        sx={{ color: 'primary.main', cursor: 'pointer' }}
                        onClick={() => fetchUser(review.employeeId._id)}
                      >
                        {review.employeeId.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        sx={{ color: 'primary.main', cursor: 'pointer' }}
                        onClick={() => fetchUser(review.managerId._id)}
                      >
                        {review.managerId.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(review.weekStartDate).toLocaleDateString()} - {new Date(review.weekEndDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={`${review.rating}/5`} 
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1 }}>
                          <Box 
                            sx={{ 
                              height: 8, 
                              bgcolor: 'primary.main', 
                              borderRadius: 1,
                              width: `${(review.rating / 5) * 100}%` 
                            }} 
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography noWrap>{review.feedback}</Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => fetchUser(review.employeeId._id)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
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
          count={reviews.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* User Details Dialog */}
      <Dialog open={Boolean(selectedUser)} onClose={() => setSelectedUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          User Details
          <IconButton
            aria-label="close"
            onClick={() => setSelectedUser(null)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Name:</strong> {selectedUser.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Email:</strong> {selectedUser.email}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Role:</strong> 
                <Chip 
                  label={selectedUser.role} 
                  size="small"
                  color={
                    selectedUser.role === 'admin' ? 'secondary' :
                    selectedUser.role === 'manager' ? 'primary' : 'default'
                  }
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                More user details can be added here as needed
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeeklyReviewAdminPage;