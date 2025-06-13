import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, Paper, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Rating, TextField, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions
} from '@mui/material';
import axios from 'axios';
import { Formik, Form, FieldArray } from 'formik';

const ManagerDashboard = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchAppraisals = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/manager/appraisals', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAppraisals(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch appraisals');
      } finally {
        setLoading(false);
      }
    };
    fetchAppraisals();
  }, []);

  const handleReviewClick = (appraisal) => {
    setSelectedAppraisal(appraisal);
    setOpenDialog(true);
  };

  const handleSubmitReview = async (values) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/manager/appraisals/${values._id}`,
        values,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      setAppraisals(appraisals.map(a => a._id === data._id ? data : a));
      setSuccess('Appraisal reviewed successfully');
      setOpenDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Appraisals to Review
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appraisals.length > 0 ? (
              appraisals.map((appraisal) => (
                <TableRow key={appraisal._id}>
                  <TableCell>{appraisal.employee.name}</TableCell>
                  <TableCell>{appraisal.employee.Department}</TableCell>
                  <TableCell>{appraisal.period} {appraisal.year}</TableCell>
                  <TableCell>{appraisal.status}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      onClick={() => handleReviewClick(appraisal)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No appraisals to review
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
            Review Appraisal - {selectedAppraisal.employee.name}
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
                                {kra.achievements}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography>Areas to Improve:</Typography>
                              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                {kra.areasToImprove}
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
                                    value={Number(values.kras[kraIndex].kpis[kpiIndex].managerRating)}
                                    onChange={handleChange}
                                    precision={0.5}
                                    size="small"
                                  />
                                </Box>
                              </Box>
                            ))}
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography>Manager Rating:</Typography>
                              <Rating
                                name={`kras[${kraIndex}].managerRating`}
                                value={Number(values.kras[kraIndex].managerRating)}
                                onChange={handleChange}
                                precision={0.5}
                              />
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    )}
                  </FieldArray>
                  
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6">Additional Comments</Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      {values.additionalComments || 'No additional comments'}
                    </Typography>
                  </Paper>
                  
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6">Career Goals</Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      {values.careerGoals || 'No career goals specified'}
                    </Typography>
                  </Paper>
                  
                  <TextField
                    name="managerFeedback"
                    label="Manager Feedback"
                    value={values.managerFeedback}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    name="actionPlan"
                    label="Action Plan"
                    value={values.actionPlan}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ mr: 2 }}>Overall Rating:</Typography>
                    <Rating
                      name="overallRating"
                      value={Number(values.overallRating)}
                      onChange={handleChange}
                      precision={0.5}
                    />
                  </Box>
                  
                  <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <CircularProgress size={24} /> : 'Submit Review'}
                    </Button>
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