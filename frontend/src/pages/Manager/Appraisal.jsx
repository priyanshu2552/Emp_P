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
  Tooltip
} from '@mui/material';
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
  const [rating, setRating] = useState({
    technicalSkills: '',
    communication: '',
    teamwork: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState(''); // 'review' or 'reject'

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
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/manager/appraisal/review/${id}`,
        { 
          managerComment: comment, 
          finalRating: typeof selectedAppraisal.selfRating === 'object' ? rating : rating.technicalSkills 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleCloseDialog();
      fetchAppraisals();
    } catch (err) {
      console.error('Review failed', err);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/manager/appraisal/reject/${id}`,
        { managerComment: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleCloseDialog();
      fetchAppraisals();
    } catch (err) {
      console.error('Rejection failed', err);
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
    
    if (typeof appraisal.selfRating === 'object') {
      setRating({
        technicalSkills: appraisal.finalRating?.technicalSkills || '',
        communication: appraisal.finalRating?.communication || '',
        teamwork: appraisal.finalRating?.teamwork || ''
      });
    } else {
      setRating({
        technicalSkills: appraisal.finalRating || '',
        communication: '',
        teamwork: ''
      });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppraisal(null);
    setComment('');
    setRating({
      technicalSkills: '',
      communication: '',
      teamwork: ''
    });
    setActionType('');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'submitted': return 'info';
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
                          {appraisal.createdAt ? new Date(appraisal.createdAt).toLocaleDateString() : 'N/A'}
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
                              disabled={appraisal.status !== 'Submitted'}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              color="error"
                              onClick={() => handleOpenDialog(appraisal, 'reject')}
                              disabled={appraisal.status !== 'Submitted'}
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
                    {selectedAppraisal.projectName}
                  </Typography>
                  <Chip
                    label={selectedAppraisal.status}
                    color={getStatusColor(selectedAppraisal.status)}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

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

              <Divider sx={{ my: 2 }} />

              {actionType !== 'view' && (
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
                  />

                  {actionType === 'review' && (
                    typeof selectedAppraisal.selfRating === 'object' ? (
                      <Box>
                        <TextField
                          fullWidth
                          type="number"
                          variant="outlined"
                          label="Technical Skills Rating (1-5)"
                          value={rating.technicalSkills}
                          onChange={(e) => setRating({...rating, technicalSkills: e.target.value})}
                          inputProps={{ min: 1, max: 5 }}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          type="number"
                          variant="outlined"
                          label="Communication Rating (1-5)"
                          value={rating.communication}
                          onChange={(e) => setRating({...rating, communication: e.target.value})}
                          inputProps={{ min: 1, max: 5 }}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          type="number"
                          variant="outlined"
                          label="Teamwork Rating (1-5)"
                          value={rating.teamwork}
                          onChange={(e) => setRating({...rating, teamwork: e.target.value})}
                          inputProps={{ min: 1, max: 5 }}
                          sx={{ mb: 2 }}
                        />
                      </Box>
                    ) : (
                      <TextField
                        fullWidth
                        type="number"
                        variant="outlined"
                        label="Final Rating (1-5)"
                        value={rating.technicalSkills}
                        onChange={(e) => setRating({...rating, technicalSkills: e.target.value})}
                        inputProps={{ min: 1, max: 5 }}
                        sx={{ mb: 2 }}
                      />
                    )
                  )}
                </Box>
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
              disabled={!comment || (typeof selectedAppraisal.selfRating === 'object' 
                ? (!rating.technicalSkills || !rating.communication || !rating.teamwork)
                : !rating.technicalSkills)}
            >
              Submit Approval
            </Button>
          )}
          {actionType === 'reject' && (
            <Button
              onClick={() => handleReject(selectedAppraisal._id)}
              color="error"
              variant="contained"
              disabled={!comment}
            >
              Confirm Rejection
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
    </ManagerLayout>
  );
};

export default ManagerAppraisal;