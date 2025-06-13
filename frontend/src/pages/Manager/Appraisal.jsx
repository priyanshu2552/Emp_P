import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, Paper, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Rating, TextField, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Select, FormControl, InputLabel, Grid
} from '@mui/material';
import axios from 'axios';
import { Formik, Form, FieldArray } from 'formik';

const ManagerDashboard = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [filteredAppraisals, setFilteredAppraisals] = useState([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    period: '',
    year: ''
  });

  useEffect(() => {
    const fetchAppraisals = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('http://localhost:5000/api/manager/appraisals', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAppraisals(data);
        setFilteredAppraisals(data); // Initialize filtered appraisals with all data
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch appraisals');
      } finally {
        setLoading(false);
      }
    };
    fetchAppraisals();
  }, [success]);

  // Apply filters whenever filters or appraisals change
  useEffect(() => {
    let result = [...appraisals];
    
    if (filters.status !== 'all') {
      result = result.filter(appraisal => appraisal.status === filters.status);
    }
    
    if (filters.period) {
      result = result.filter(appraisal => appraisal.period === filters.period);
    }
    
    if (filters.year) {
      result = result.filter(appraisal => appraisal.year.toString() === filters.year);
    }
    
    setFilteredAppraisals(result);
  }, [filters, appraisals]);

  const handleReviewClick = (appraisal) => {
    setSelectedAppraisal(appraisal);
    setOpenDialog(true);
  };

  const handleSubmitReview = async (values, { setSubmitting }) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/manager/appraisals/${values._id}/review`,
        values,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      setAppraisals(appraisals.map(a => a._id === data._id ? data : a));
      setSuccess('Appraisal reviewed successfully');
      setError('');
      setOpenDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Extract unique periods and years for filter options
  const periods = [...new Set(appraisals.map(a => a.period))];
  const years = [...new Set(appraisals.map(a => a.year.toString()))];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Appraisals to Review
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      
      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="submitted">Pending Review</MenuItem>
                <MenuItem value="reviewed">Reviewed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select
                name="period"
                value={filters.period}
                onChange={handleFilterChange}
                label="Period"
              >
                <MenuItem value="">All</MenuItem>
                {periods.map(period => (
                  <MenuItem key={period} value={period}>{period}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                label="Year"
              >
                <MenuItem value="">All</MenuItem>
                {years.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAppraisals.length > 0 ? (
              filteredAppraisals.map((appraisal) => (
                <TableRow key={appraisal._id}>
                  <TableCell>{appraisal.employee?.name || 'N/A'}</TableCell>
                  <TableCell>{appraisal.employee?.department || 'N/A'}</TableCell>
                  <TableCell>{appraisal.period}</TableCell>
                  <TableCell>{appraisal.year}</TableCell>
                  <TableCell>
                    {appraisal.status === 'submitted' ? 'Pending Review' : 'Reviewed'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      onClick={() => handleReviewClick(appraisal)}
                      disabled={appraisal.status !== 'submitted'}
                    >
                      {appraisal.status === 'submitted' ? 'Review' : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No appraisals found matching your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {selectedAppraisal && (
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {selectedAppraisal.status === 'submitted' ? 'Review' : 'View'} Appraisal - {selectedAppraisal.employee?.name || 'Employee'}
          </DialogTitle>
          <DialogContent>
            <Formik
              initialValues={selectedAppraisal}
              onSubmit={handleSubmitReview}
            >
              {({ values, handleChange, isSubmitting }) => (
                <Form>
                  <FieldArray name="kras">
                    {() => (
                      <Box sx={{ mt: 2 }}>
                        {values.kras.map((kra, kraIndex) => (
                          <Paper key={kraIndex} sx={{ p: 2, mb: 2 }}>
                            <Typography variant="h6">{kra.name}</Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography sx={{ mr: 2 }}>Employee Rating:</Typography>
                              <Rating value={kra.selfRating} readOnly precision={0.5} />
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography>Achievements:</Typography>
                              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                {kra.achievements || 'No achievements specified'}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography>Areas to Improve:</Typography>
                              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                {kra.areasToImprove || 'No areas to improve specified'}
                              </Typography>
                            </Box>
                            
                            <Typography variant="subtitle1">KPIs</Typography>
                            {kra.kpis.map((kpi, kpiIndex) => (
                              <Box key={kpiIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography sx={{ flex: 1 }}>
                                  {kpi.name} (Target: {kpi.target})
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography sx={{ mr: 1 }}>Emp:</Typography>
                                  <Rating value={kpi.selfRating} readOnly precision={0.5} size="small" />
                                  <Typography sx={{ mx: 1 }}>Mgr:</Typography>
                                  <Rating
                                    name={`kras[${kraIndex}].kpis[${kpiIndex}].managerRating`}
                                    value={Number(values.kras[kraIndex].kpis[kpiIndex].managerRating || 0)}
                                    onChange={handleChange}
                                    precision={0.5}
                                    size="small"
                                    readOnly={values.status !== 'submitted'}
                                  />
                                </Box>
                              </Box>
                            ))}
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography>Manager Rating:</Typography>
                              <Rating
                                name={`kras[${kraIndex}].managerRating`}
                                value={Number(values.kras[kraIndex].managerRating || 0)}
                                onChange={handleChange}
                                precision={0.5}
                                readOnly={values.status !== 'submitted'}
                              />
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    )}
                  </FieldArray>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6">Manager Feedback</Typography>
                    <TextField
                      name="managerFeedback"
                      value={values.managerFeedback || ''}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      disabled={values.status !== 'submitted'}
                    />
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6">Action Plan</Typography>
                    <TextField
                      name="actionPlan"
                      value={values.actionPlan || ''}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      disabled={values.status !== 'submitted'}
                    />
                  </Box>
                  
                  <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ mr: 2 }}>Overall Rating:</Typography>
                    <Rating
                      name="overallRating"
                      value={Number(values.overallRating || 0)}
                      onChange={handleChange}
                      precision={0.5}
                      readOnly={values.status !== 'submitted'}
                    />
                  </Box>
                  
                  <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    {values.status === 'submitted' && (
                      <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : 'Submit Review'}
                      </Button>
                    )}
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
};

export default ManagerDashboard;