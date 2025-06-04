import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Grid,
  CircularProgress
} from '@mui/material';
import { useSnackbar } from 'notistack';
import ManagerLayout from '../../components/Layout/ManagerLayout';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Star as RatingIcon
} from '@mui/icons-material';

const ManagerAppraisal = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [processing, setProcessing] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/manager/appraisal', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppraisals(res.data);
    } catch (err) {
      console.error('Failed to fetch appraisals', err);
      enqueueSnackbar('Failed to load appraisals', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReview = async (id) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      
      // Convert rating to number
      const finalRating = Number(rating);

      const requestData = {
        managerComment: comment,
        finalRating: finalRating,
        status: 'reviewed'
      };

      await axios.put(
        `http://localhost:5000/api/manager/appraisal/review/${id}`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      handleCloseDialog();
      fetchAppraisals();
      enqueueSnackbar('Appraisal approved successfully', { variant: 'success' });
    } catch (err) {
      console.error('Review failed', err);
      enqueueSnackbar(err.response?.data?.message || 'Failed to approve appraisal', { variant: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      
      const requestData = {
        managerComment: comment,
        status: 'rejected'
      };

      await axios.put(
        `http://localhost:5000/api/manager/appraisal/reject/${id}`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      handleCloseDialog();
      fetchAppraisals();
      enqueueSnackbar('Appraisal rejected successfully', { variant: 'success' });
    } catch (err) {
      console.error('Rejection failed', err);
      enqueueSnackbar(err.response?.data?.message || 'Failed to reject appraisal', { variant: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (appraisal, type) => {
    setSelectedAppraisal(appraisal);
    setActionType(type);
    setOpenDialog(true);
    setComment(appraisal.managerComment || '');
    setRating(appraisal.finalRating || '');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppraisal(null);
    setComment('');
    setRating('');
    setActionType('');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'submitted': return 'info';
      case 'draft': return 'default';
      case 'reviewed': return 'success';
      default: return 'default';
    }
  };

  const renderRating = (ratingData) => {
    if (!ratingData) return 'N/A';
    
    if (typeof ratingData === 'object') {
      return (
        <Box>
          <Typography variant="body2">Technical: {ratingData.technicalSkills || 'N/A'}</Typography>
          <Typography variant="body2">Communication: {ratingData.communication || 'N/A'}</Typography>
          <Typography variant="body2">Teamwork: {ratingData.teamwork || 'N/A'}</Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <RatingIcon color="warning" sx={{ mr: 0.5 }} />
        {ratingData}
      </Box>
    );
  };

  return (
    <ManagerLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Appraisal Reviews
        </Typography>

        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Pending Appraisal Reviews
          </Typography>

          {loading ? (
            <LinearProgress />
          ) : appraisals.length === 0 ? (
            <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
              No appraisals assigned to you yet.
            </Typography>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.light' }}>
                      <TableCell sx={{ color: 'white' }}>Employee</TableCell>
                      <TableCell sx={{ color: 'white' }}>Project</TableCell>
                      <TableCell sx={{ color: 'white' }}>Period</TableCell>
                      <TableCell sx={{ color: 'white' }}>Self Rating</TableCell>
                      <TableCell sx={{ color: 'white' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white' }}>Submitted On</TableCell>
                      <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appraisals
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((appraisal) => (
                        <TableRow key={appraisal._id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={typeof appraisal.userId === 'object' ? appraisal.userId.image : '/default-avatar.png'}
                                sx={{ mr: 2, width: 36, height: 36 }}
                              />
                              {typeof appraisal.userId === 'object' ? appraisal.userId.name : appraisal.userId}
                            </Box>
                          </TableCell>
                          <TableCell>{appraisal.projectName}</TableCell>
                          <TableCell>{appraisal.period}</TableCell>
                          <TableCell>
                            {renderRating(appraisal.selfRating)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={appraisal.status}
                              color={getStatusColor(appraisal.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {appraisal.submittedAt ? new Date(appraisal.submittedAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenDialog(appraisal, 'view')}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Approve">
                              <IconButton
                                color="success"
                                onClick={() => handleOpenDialog(appraisal, 'review')}
                                disabled={appraisal.status !== 'Submitted' && appraisal.status !== 'submitted'}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                color="error"
                                onClick={() => handleOpenDialog(appraisal, 'reject')}
                                disabled={appraisal.status !== 'Submitted' && appraisal.status !== 'submitted'}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={appraisals.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Paper>

        {/* Appraisal Detail Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              {actionType === 'view' && 'Appraisal Details'}
              {actionType === 'review' && 'Approve Appraisal'}
              {actionType === 'reject' && 'Reject Appraisal'}
            </Box>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            {selectedAppraisal && (
              <Box>
                <Box sx={{ display: 'flex', mb: 3 }}>
                  <Avatar
                    src={typeof selectedAppraisal.userId === 'object' ? selectedAppraisal.userId.image : '/default-avatar.png'}
                    sx={{ width: 64, height: 64, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">
                      {typeof selectedAppraisal.userId === 'object' ? selectedAppraisal.userId.name : selectedAppraisal.userId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedAppraisal.projectName} • {selectedAppraisal.period}
                    </Typography>
                    <Chip
                      label={selectedAppraisal.status}
                      color={getStatusColor(selectedAppraisal.status)}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Work Summary
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                        {selectedAppraisal.workSummary || 'No work summary provided.'}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Technologies Used
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedAppraisal.technologiesUsed?.length > 0 ? (
                          selectedAppraisal.technologiesUsed.map((tech, index) => (
                            <Chip key={index} label={tech} variant="outlined" />
                          ))
                        ) : (
                          <Typography variant="body2">No technologies listed</Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Achievements
                      </Typography>
                      {selectedAppraisal.achievements?.length > 0 ? (
                        <ul style={{ paddingLeft: 20 }}>
                          {selectedAppraisal.achievements.map((achievement, index) => (
                            <li key={index}>
                              <Typography variant="body1">{achievement}</Typography>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Typography variant="body2">No achievements listed</Typography>
                      )}
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Additional Comments
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {selectedAppraisal.additionalComments || 'No additional comments'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Employee Self-Assessment
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {selectedAppraisal.selfAssessment || 'No self-assessment provided.'}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Self Rating:
                    </Typography>
                    {renderRating(selectedAppraisal.selfRating)}
                  </Box>
                </Box>

                {selectedAppraisal.managerComment && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Manager's Feedback
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                        {selectedAppraisal.managerComment}
                      </Typography>
                      {selectedAppraisal.finalRating && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Final Rating:
                          </Typography>
                          {renderRating(selectedAppraisal.finalRating)}
                        </Box>
                      )}
                    </Box>
                  </>
                )}

                {(actionType === 'review' || actionType === 'reject') && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {actionType === 'review' ? 'Your Review' : 'Rejection Reason'}
                      </Typography>

                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        label="Comments"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                      />

                      {actionType === 'review' && (
                        <TextField
                          fullWidth
                          type="number"
                          variant="outlined"
                          label="Final Rating (1-5)"
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          inputProps={{ min: 1, max: 5 }}
                          sx={{ mb: 2 }}
                          required
                        />
                      )}
                    </Box>
                  </>
                )}
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} color="secondary" variant="outlined">
              Cancel
            </Button>
            {actionType === 'review' && (
              <Button
                onClick={() => handleReview(selectedAppraisal._id)}
                color="success"
                variant="contained"
                disabled={processing || !comment || !rating}
              >
                {processing ? <CircularProgress size={24} /> : 'Submit Approval'}
              </Button>
            )}
            {actionType === 'reject' && (
              <Button
                onClick={() => handleReject(selectedAppraisal._id)}
                color="error"
                variant="contained"
                disabled={processing || !comment}
              >
                {processing ? <CircularProgress size={24} /> : 'Confirm Rejection'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </ManagerLayout>
  );
};

export default ManagerAppraisal;