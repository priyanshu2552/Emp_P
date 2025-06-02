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
  Paper,
  Chip,
  CircularProgress,
  TablePagination,
  Modal,
  Divider,
  IconButton
} from '@mui/material';
import { Refresh, Close } from '@mui/icons-material';
import DashboardLayout from '../../components/Layout/EmployeeLayout';

const API_BASE = 'http://localhost:5000/api/employees';

const EmployeeReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const token = localStorage.getItem('token');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setOpenModal(true);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated reviews
  const paginatedReviews = reviews.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 2.5) return 'warning';
    return 'error';
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
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              fontSize: '1.1rem'
            }}>
              Weekly Performance Reviews
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchReviews}
              sx={{ 
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              Refresh
            </Button>
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
              <Typography variant="subtitle2" color="text.secondary">Total Reviews</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{reviews.length}</Typography>
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
              <Typography variant="subtitle2" color="text.secondary">Average Rating</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
  {reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0}
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
              <Typography variant="subtitle2" color="text.secondary">Recent Review</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {reviews.length > 0 
                  ? new Date(reviews[0].weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'N/A'}
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
                Your Review History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Showing {paginatedReviews.length} of {reviews.length} entries
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
                        <TableCell sx={{ fontWeight: 600 }}>Week</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Manager</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Accomplishments</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedReviews.length > 0 ? (
                        paginatedReviews.map((review) => (
                          <TableRow 
                            key={review._id} 
                            hover
                            sx={{ 
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              }
                            }}
                          >
                            <TableCell>
                              {new Date(review.weekStartDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })} - {new Date(review.weekEndDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>
                              {review.managerId?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {review.accomplishments.slice(0, 2).map((a, i) => (
                                <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                                  • {a.length > 50 ? `${a.substring(0, 50)}...` : a}
                                </Typography>
                              ))}
                              {review.accomplishments.length > 2 && (
                                <Typography variant="body2" color="text.secondary">
                                  +{review.accomplishments.length - 2} more
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`${review.rating}/5`} 
                                color={getRatingColor(review.rating)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => handleViewDetails(review)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No reviews found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {reviews.length > rowsPerPage && (
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={reviews.length}
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
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Review Details Modal */}
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '700px' },
              bgcolor: 'background.paper',
              borderRadius: '8px',
              boxShadow: 24,
              p: 3,
              outline: 'none',
              border: '1px solid #e0e0e0',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Review Details
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

              {selectedReview && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Week:</Typography>
                    <Typography>
                      {new Date(selectedReview.weekStartDate).toLocaleDateString()} - {new Date(selectedReview.weekEndDate).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Manager:</Typography>
                    <Typography>{selectedReview.managerId?.name || 'N/A'}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Accomplishments:</Typography>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {selectedReview.accomplishments.map((a, i) => (
                        <li key={i} style={{ marginBottom: '8px' }}>
                          <Typography variant="body1">{a}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Feedback:</Typography>
                    <Typography>{selectedReview.feedback}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Rating:</Typography>
                    <Chip 
                      label={`${selectedReview.rating}/5`} 
                      color={getRatingColor(selectedReview.rating)}
                      size="medium"
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Modal>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default EmployeeReviews;