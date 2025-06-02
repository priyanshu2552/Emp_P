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
  Modal,
  Divider,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
  TablePagination,
  TextareaAutosize,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Close, Refresh } from '@mui/icons-material';
import DashboardLayout from '../../components/Layout/EmployeeLayout';
import axios from 'axios';

const AppraisalFormAndList = () => {
  const [formData, setFormData] = useState({
    period: '',
    projectName: '',
    workSummary: '',
    technologiesUsed: '',
    achievements: '',
    selfRating: '',
    additionalComments: '',
    attachments: '',
  });

  const [appraisals, setAppraisals] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch earlier appraisals on component mount
  useEffect(() => {
    const fetchAppraisals = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/api/employees/appraisal',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setAppraisals(response.data);
      } catch (err) {
        setError('Failed to fetch appraisals');
      } finally {
        setLoading(false);
      }
    };
    fetchAppraisals();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const dataToSend = {
      ...formData,
      technologiesUsed: formData.technologiesUsed.split(',').map(s => s.trim()),
      achievements: formData.achievements.split(',').map(s => s.trim()),
      attachments: formData.attachments ? formData.attachments.split(',').map(s => s.trim()) : [],
      selfRating: {
        technicalSkills: Number(formData.selfRating) || 3,
        communication: Number(formData.selfRating) || 3,
        teamwork: Number(formData.selfRating) || 3,
      }
    };

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/employees/appraisal',
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );

      setMessage('Appraisal created successfully!');
      setAppraisals(prev => [response.data, ...prev]);
      setFormData({
        period: '',
        projectName: '',
        workSummary: '',
        technologiesUsed: '',
        achievements: '',
        selfRating: '',
        additionalComments: '',
        attachments: '',
      });
      setOpenModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating appraisal');
    }
  };

  const handleViewDetails = (appraisal) => {
    setSelectedAppraisal(appraisal);
    setOpenDetailsModal(true);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated appraisals
  const paginatedAppraisals = appraisals.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'info';
    }
  };

  const refreshAppraisals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/employees/appraisal',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAppraisals(response.data);
    } catch (err) {
      setError('Failed to fetch appraisals');
    } finally {
      setLoading(false);
    }
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
              Performance Appraisals
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={refreshAppraisals}
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
                New Appraisal
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
              <Typography variant="subtitle2" color="text.secondary">Total Appraisals</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{appraisals.length}</Typography>
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
                {appraisals.filter(a => a.status === 'pending').length}
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
                {appraisals.filter(a => a.status === 'approved').length}
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
                Your Appraisal History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Showing {paginatedAppraisals.length} of {appraisals.length} entries
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
                        <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Self Rating</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedAppraisals.length > 0 ? (
                        paginatedAppraisals.map((appraisal) => (
                          <TableRow 
                            key={appraisal._id} 
                            hover
                            sx={{ 
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              }
                            }}
                          >
                            <TableCell>
                              {appraisal.period}
                            </TableCell>
                            <TableCell>
                              {appraisal.projectName || '-'}
                            </TableCell>
                            <TableCell>
                              {appraisal.selfRating ? 
                                (appraisal.selfRating.technicalSkills + appraisal.selfRating.communication + appraisal.selfRating.teamwork) / 3 
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={appraisal.status} 
                                color={getStatusColor(appraisal.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(appraisal.submittedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => handleViewDetails(appraisal)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No appraisals found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {appraisals.length > rowsPerPage && (
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={appraisals.length}
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

          {/* New Appraisal Modal */}
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '600px' },
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
                  New Appraisal Request
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
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Period (e.g. Q1 2025)"
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Project Name"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Work Summary"
                  name="workSummary"
                  value={formData.workSummary}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Technologies Used (comma separated)"
                  name="technologiesUsed"
                  value={formData.technologiesUsed}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Achievements (comma separated)"
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />

                <Select
                  fullWidth
                  label="Self Rating (1-5)"
                  name="selfRating"
                  value={formData.selfRating}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value={1}>1 - Needs Improvement</MenuItem>
                  <MenuItem value={2}>2 - Developing</MenuItem>
                  <MenuItem value={3}>3 - Meets Expectations</MenuItem>
                  <MenuItem value={4}>4 - Exceeds Expectations</MenuItem>
                  <MenuItem value={5}>5 - Outstanding</MenuItem>
                </Select>

                <TextField
                  fullWidth
                  label="Additional Comments"
                  name="additionalComments"
                  value={formData.additionalComments}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Attachments (comma separated URLs)"
                  name="attachments"
                  value={formData.attachments}
                  onChange={handleChange}
                  sx={{ mb: 3 }}
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
                    Submit Appraisal
                  </Button>
                </Box>
              </form>
            </Box>
          </Modal>

          {/* Appraisal Details Modal */}
          <Modal open={openDetailsModal} onClose={() => setOpenDetailsModal(false)}>
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
                  Appraisal Details
                </Typography>
                <IconButton 
                  onClick={() => setOpenDetailsModal(false)}
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

              {selectedAppraisal && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Period:</Typography>
                    <Typography>{selectedAppraisal.period}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Project Name:</Typography>
                    <Typography>{selectedAppraisal.projectName || '-'}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Work Summary:</Typography>
                    <Typography>{selectedAppraisal.workSummary}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Technologies Used:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedAppraisal.technologiesUsed?.map((tech, index) => (
                        <Chip key={index} label={tech} size="small" />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Achievements:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedAppraisal.achievements?.map((ach, index) => (
                        <Chip key={index} label={ach} size="small" color="success" />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Self Rating:</Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Box>
                        <Typography variant="body2">Technical Skills:</Typography>
                        <Typography>{selectedAppraisal.selfRating?.technicalSkills || '-'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2">Communication:</Typography>
                        <Typography>{selectedAppraisal.selfRating?.communication || '-'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2">Teamwork:</Typography>
                        <Typography>{selectedAppraisal.selfRating?.teamwork || '-'}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Additional Comments:</Typography>
                    <Typography>{selectedAppraisal.additionalComments || '-'}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Attachments:</Typography>
                    {selectedAppraisal.attachments?.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedAppraisal.attachments.map((url, index) => (
                          <Chip 
                            key={index} 
                            label={`Attachment ${index + 1}`} 
                            size="small" 
                            color="info"
                            component="a"
                            href={url}
                            target="_blank"
                            clickable
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography>-</Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Status:</Typography>
                    <Chip 
                      label={selectedAppraisal.status} 
                      color={getStatusColor(selectedAppraisal.status)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Submitted At:</Typography>
                    <Typography>
                      {new Date(selectedAppraisal.submittedAt).toLocaleString()}
                    </Typography>
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

export default AppraisalFormAndList;