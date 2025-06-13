import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Paper,
  TextField, Rating, Alert, CircularProgress, Card, CardContent,
  Select, MenuItem, FormControl, InputLabel, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import axios from 'axios';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import DashboardLayout from '../../components/Layout/EmployeeLayout';
const EmployeeDashboard = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [currentAppraisal, setCurrentAppraisal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [periodOptions, setPeriodOptions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const navigate = useNavigate();

  // Fetch all appraisals and available periods
  useEffect(() => {
    const fetchAppraisalData = async () => {
      try {
        setLoading(true);

        // Fetch all appraisals for the employee
        const response = await axios.get('http://localhost:5000/api/employees/appraisals', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        setAppraisals(response.data.appraisals);
        setPeriodOptions(response.data.periodOptions);

        // Set default to current period if available
        const currentPeriod = getCurrentPeriod();
        if (response.data.periodOptions.includes(currentPeriod.period)) {
          setSelectedPeriod(currentPeriod.period);
          setSelectedYear(currentPeriod.year);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch appraisal data');
      } finally {
        setLoading(false);
      }
    };

    fetchAppraisalData();
  }, []);

  // Fetch specific appraisal when period/year changes
  useEffect(() => {
    if (!selectedPeriod || viewMode === 'list') return;

    const fetchCurrentAppraisal = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/employees/appraisal?period=${selectedPeriod}&year=${selectedYear}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        setCurrentAppraisal(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch appraisal data');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentAppraisal();
  }, [selectedPeriod, selectedYear, viewMode]);

  const getCurrentPeriod = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    if (month >= 1 && month <= 3) return { period: 'Q1', year };
    if (month >= 4 && month <= 6) return { period: 'Q2', year };
    if (month >= 7 && month <= 9) return { period: 'Q3', year };
    if (month >= 10 && month <= 12) return { period: 'Q4', year };
    return { period: 'Annual', year };
  };

  const initialValues = currentAppraisal || {
    period: selectedPeriod || getCurrentPeriod().period,
    year: selectedYear || getCurrentPeriod().year,
    kras: [
      {
        name: 'Code Quality',
        selfRating: null,
        achievements: '',
        areasToImprove: '',
        kpis: [
          { name: 'Code review pass rate', target: '90%+', selfRating: null },
          { name: 'Defect leakage', target: '<5%', selfRating: null },
          { name: 'Coding standards', target: '100% adherence', selfRating: null }
        ]
      },
      {
        name: 'On-Time Delivery',
        selfRating: null,
        achievements: '',
        areasToImprove: '',
        kpis: [
          { name: 'Sprint completion', target: '95%', selfRating: null },
          { name: 'Scope creep', target: '<10%', selfRating: null }
        ]
      }
    ],
    additionalComments: '',
    careerGoals: ''
  };

  const validationSchema = Yup.object().shape({
    kras: Yup.array().of(
      Yup.object().shape({
        selfRating: Yup.number()
          .min(1, 'Rating must be at least 1')
          .max(5, 'Rating must be at most 5')
          .required('Rating is required'),
        achievements: Yup.string().required('Achievements are required'),
        areasToImprove: Yup.string().required('Areas to improve are required'),
        kpis: Yup.array().of(
          Yup.object().shape({
            selfRating: Yup.number()
              .min(1, 'Rating must be at least 1')
              .max(5, 'Rating must be at most 5')
              .required('Rating is required')
          })
        )
      })
    ),
    additionalComments: Yup.string(),
    careerGoals: Yup.string()
  });

  const handleSaveDraft = async (values, { setSubmitting }) => {
    try {
      const { data } = await axios.put(
        'http://localhost:5000/api/employees/appraisal',
        values,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setCurrentAppraisal(data);
      setSuccess('Draft saved successfully');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save draft');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAppraisal = async (values) => {
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/employees/appraisal/submit',
        values,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      // Update the appraisals list with the newly submitted appraisal
      setAppraisals(prev => {
        const existingIndex = prev.findIndex(a =>
          a._id === data._id ||
          (a.period === data.period && a.year === data.year)
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = data;
          return updated;
        }
        return [...prev, data];
      });

      setSuccess('Appraisal submitted successfully');
      setError('');
      setViewMode('list'); // Switch to list view after submission
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit appraisal');
    }
  };

  const handlePeriodChange = (event) => {
    setSelectedPeriod(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleViewAppraisal = (appraisal) => {
    setCurrentAppraisal(appraisal);
    setSelectedPeriod(appraisal.period);
    setSelectedYear(appraisal.year);
    setViewMode('detail');
  };

  const handleCreateNew = () => {
    setCurrentAppraisal(null);
    setViewMode('detail');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'submitted': return 'info';
      case 'reviewed': return 'success';
      case 'rejected': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Appraisal List View
  if (viewMode === 'list') {
   
    return (
       <DashboardLayout>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">My Appraisals</Typography>
          <Button
            variant="contained"
            onClick={handleCreateNew}
            disabled={!periodOptions.length}
          >
            Create New Appraisal
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {appraisals.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No appraisals found
            </Typography>
            <Typography sx={{ mb: 2 }}>
              You haven't created any appraisals yet. Start by creating a new one.
            </Typography>
            <Button
              variant="contained"
              onClick={handleCreateNew}
              disabled={!periodOptions.length}
            >
              Create New Appraisal
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Overall Rating</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appraisals.map((appraisal) => (
                  <TableRow key={appraisal._id}>
                    <TableCell>{appraisal.period}</TableCell>
                    <TableCell>{appraisal.year}</TableCell>
                    <TableCell>
                      <Chip
                        label={appraisal.status}
                        color={getStatusColor(appraisal.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {appraisal.overallRating ? (
                        <Rating value={appraisal.overallRating} precision={0.5} readOnly />
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {appraisal.submittedAt ?
                        dayjs(appraisal.submittedAt).format('MMM D, YYYY') :
                        'Not submitted'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleViewAppraisal(appraisal)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
      </DashboardLayout>
    );
  }

  // Appraisal Detail View (Edit or Read-only)
  return (
    <DashboardLayout>
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {currentAppraisal ?
            `Appraisal - ${currentAppraisal.period} ${currentAppraisal.year}` :
            'Create New Appraisal'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={selectedPeriod}
              label="Period"
              onChange={handlePeriodChange}
              disabled={currentAppraisal?.status !== 'draft'}
            >
              {periodOptions.map((period) => (
                <MenuItem key={period} value={period}>{period}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={handleYearChange}
              disabled={currentAppraisal?.status !== 'draft'}
            >
              {[selectedYear - 1, selectedYear, selectedYear + 1].map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {currentAppraisal?.status === 'reviewed' && (
        <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Manager Evaluation
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Overall Rating</Typography>
              <Rating value={currentAppraisal.overallRating} precision={0.5} readOnly />
              <Typography>({currentAppraisal.overallRating}/5)</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Feedback</Typography>
              <Typography sx={{ whiteSpace: 'pre-line' }}>{currentAppraisal.managerFeedback}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Action Plan</Typography>
              <Typography sx={{ whiteSpace: 'pre-line' }}>{currentAppraisal.actionPlan}</Typography>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Reviewed on: {dayjs(currentAppraisal.reviewedAt).format('MMMM D, YYYY')}
            </Typography>
          </CardContent>
        </Card>
      )}
      {currentAppraisal?.status !== 'draft' ? (
        // Read-only view for submitted/reviewed appraisals
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSaveDraft}
          enableReinitialize
        >
          {({ values }) => (
            <Form>
              <FieldArray name="kras">
                {() => (
                  <Box>
                    {values.kras.map((kra, kraIndex) => (
                      <Paper key={kraIndex} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          {kra.name}
                        </Typography>

                        <Grid container spacing={2}>
                          {/* Self Evaluation Column */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{
                              p: 2,
                              backgroundColor: '#f0f7ff',
                              borderRadius: 1,
                              height: '100%'
                            }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Your Self Evaluation
                              </Typography>

                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Self Rating</Typography>
                                <Rating
                                  value={Number(kra.selfRating)}
                                  precision={1}
                                  readOnly
                                />
                              </Box>

                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Achievements</Typography>
                                <Typography sx={{ whiteSpace: 'pre-line' }}>
                                  {kra.achievements || 'Not provided'}
                                </Typography>
                              </Box>

                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Areas to Improve</Typography>
                                <Typography sx={{ whiteSpace: 'pre-line' }}>
                                  {kra.areasToImprove || 'Not provided'}
                                </Typography>
                              </Box>

                              <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>
                                Your KPI Ratings
                              </Typography>
                              {kra.kpis.map((kpi, kpiIndex) => (
                                <Box
                                  key={kpiIndex}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1,
                                    p: 1,
                                    backgroundColor: '#e1f0ff',
                                    borderRadius: 1
                                  }}
                                >
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                      {kpi.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Target: {kpi.target}
                                    </Typography>
                                  </Box>
                                  <Rating
                                    value={Number(kpi.selfRating)}
                                    precision={1}
                                    readOnly
                                  />
                                </Box>
                              ))}
                            </Box>
                          </Grid>

                          {/* Manager Feedback Column - Only show if appraisal is reviewed */}
                          {currentAppraisal?.status === 'reviewed' && (
                            <Grid item xs={12} md={6}>
                              <Box sx={{
                                p: 2,
                                backgroundColor: '#fff5f5',
                                borderRadius: 1,
                                height: '100%'
                              }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  Manager's Evaluation
                                </Typography>

                                {currentAppraisal.kras[kraIndex]?.managerRating && (
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2">Manager Rating</Typography>
                                    <Rating
                                      value={Number(currentAppraisal.kras[kraIndex].managerRating)}
                                      precision={1}
                                      readOnly
                                    />
                                  </Box>
                                )}

                                {currentAppraisal.kras[kraIndex]?.managerComments && (
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2">Manager Comments</Typography>
                                    <Typography sx={{ whiteSpace: 'pre-line' }}>
                                      {currentAppraisal.kras[kraIndex].managerComments || 'No comments provided'}
                                    </Typography>
                                  </Box>
                                )}

                                {currentAppraisal.kras[kraIndex]?.kpis && (
                                  <>
                                    <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>
                                      Manager's KPI Ratings
                                    </Typography>
                                    {currentAppraisal.kras[kraIndex].kpis.map((kpi, kpiIndex) => (
                                      <Box
                                        key={kpiIndex}
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          mb: 1,
                                          p: 1,
                                          backgroundColor: '#ffeaea',
                                          borderRadius: 1
                                        }}
                                      >
                                        <Box sx={{ flex: 1 }}>
                                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                            {kpi.name}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            Target: {kpi.target}
                                          </Typography>
                                        </Box>
                                        <Rating
                                          value={Number(kpi.managerRating)}
                                          precision={1}
                                          readOnly
                                        />
                                      </Box>
                                    ))}
                                  </>
                                )}
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    ))}
                  </Box>
                )}
              </FieldArray>

              <Grid container spacing={2}>
                {/* Self Evaluation Column */}
                <Grid item xs={12} md={currentAppraisal?.status === 'reviewed' ? 6 : 12}>
                  <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f0f7ff' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Your Additional Comments
                    </Typography>
                    <Typography sx={{ whiteSpace: 'pre-line' }}>
                      {values.additionalComments || 'No comments provided'}
                    </Typography>
                  </Paper>

                  <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f0f7ff' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Your Career Goals
                    </Typography>
                    <Typography sx={{ whiteSpace: 'pre-line' }}>
                      {values.careerGoals || 'No goals provided'}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Manager Feedback Column - Only show if appraisal is reviewed */}
                {currentAppraisal?.status === 'reviewed' && (
                  <Grid item xs={12} md={6}>
                    {currentAppraisal.managerFeedback && (
                      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#fff5f5' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Manager's Overall Feedback
                        </Typography>
                        <Typography sx={{ whiteSpace: 'pre-line' }}>
                          {currentAppraisal.managerFeedback}
                        </Typography>
                      </Paper>
                    )}

                    {currentAppraisal.actionPlan && (
                      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#fff5f5' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Manager's Action Plan
                        </Typography>
                        <Typography sx={{ whiteSpace: 'pre-line' }}>
                          {currentAppraisal.actionPlan}
                        </Typography>
                      </Paper>
                    )}

                    <Paper sx={{ p: 3, mb: 3, backgroundColor: '#fff5f5' }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Overall Rating
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Rating
                          value={currentAppraisal.overallRating}
                          precision={0.5}
                          readOnly
                        />
                        <Typography>({currentAppraisal.overallRating}/5)</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => setViewMode('list')}
                >
                  Back to List
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      ) : (
        // Edit mode for draft appraisals
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSaveDraft}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
            submitForm,
            setSubmitting,
            isValid
          }) => (
            <Form>
              <FieldArray name="kras">
                {() => (
                  <Box>
                    {values.kras.map((kra, kraIndex) => (
                      <Paper key={kraIndex} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          {kra.name}
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle1">Self Rating</Typography>
                              <Rating
                                name={`kras[${kraIndex}].selfRating`}
                                value={Number(values.kras[kraIndex].selfRating)}
                                onChange={(e, newValue) => {
                                  handleChange({
                                    target: {
                                      name: `kras[${kraIndex}].selfRating`,
                                      value: newValue
                                    }
                                  });
                                }}
                                precision={1}
                              />
                              {errors.kras?.[kraIndex]?.selfRating && touched.kras?.[kraIndex]?.selfRating && (
                                <Typography color="error" variant="caption">
                                  {errors.kras[kraIndex].selfRating}
                                </Typography>
                              )}
                            </Box>
                          </Grid>

                          <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle1">Achievements</Typography>
                              <TextField
                                name={`kras[${kraIndex}].achievements`}
                                value={values.kras[kraIndex].achievements}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                fullWidth
                                multiline
                                rows={3}
                                error={Boolean(errors.kras?.[kraIndex]?.achievements && touched.kras?.[kraIndex]?.achievements)}
                                helperText={
                                  errors.kras?.[kraIndex]?.achievements && touched.kras?.[kraIndex]?.achievements
                                    ? errors.kras[kraIndex].achievements
                                    : 'Describe your key achievements in this area'
                                }
                              />
                            </Box>
                          </Grid>

                          <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle1">Areas to Improve</Typography>
                              <TextField
                                name={`kras[${kraIndex}].areasToImprove`}
                                value={values.kras[kraIndex].areasToImprove}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                fullWidth
                                multiline
                                rows={3}
                                error={Boolean(errors.kras?.[kraIndex]?.areasToImprove && touched.kras?.[kraIndex]?.areasToImprove)}
                                helperText={
                                  errors.kras?.[kraIndex]?.areasToImprove && touched.kras?.[kraIndex]?.areasToImprove
                                    ? errors.kras[kraIndex].areasToImprove
                                    : 'Identify areas where you can improve'
                                }
                              />
                            </Box>
                          </Grid>
                        </Grid>

                        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                          KPIs
                        </Typography>

                        {kra.kpis.map((kpi, kpiIndex) => (
                          <Box
                            key={kpiIndex}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mb: 1,
                              p: 1,
                              backgroundColor: '#f9f9f9',
                              borderRadius: 1
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {kpi.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Target: {kpi.target}
                              </Typography>
                            </Box>
                            <Rating
                              name={`kras[${kraIndex}].kpis[${kpiIndex}].selfRating`}
                              value={Number(values.kras[kraIndex].kpis[kpiIndex].selfRating)}
                              onChange={(e, newValue) => {
                                handleChange({
                                  target: {
                                    name: `kras[${kraIndex}].kpis[${kpiIndex}].selfRating`,
                                    value: newValue
                                  }
                                });
                              }}
                              precision={1}
                            />
                            {errors.kras?.[kraIndex]?.kpis?.[kpiIndex]?.selfRating && (
                              <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                                Required
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Paper>
                    ))}
                  </Box>
                )}
              </FieldArray>

              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Additional Comments
                </Typography>
                <TextField
                  name="additionalComments"
                  value={values.additionalComments}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Any additional comments about your performance..."
                />
              </Paper>

              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Career Goals
                </Typography>
                <TextField
                  name="careerGoals"
                  value={values.careerGoals}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe your short-term and long-term career goals..."
                />
              </Paper>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Box>
                  <Button
                    variant="outlined"
                    onClick={() => setViewMode('list')}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Save Draft'}
                  </Button>
                </Box>

                <Button
                  variant="contained"
                  color="success"
                  type="button"
                  onClick={async () => {
                    await submitForm();
                    if (isValid) {
                      handleSubmitAppraisal(values);
                    }
                  }}
                  disabled={isSubmitting || !isValid}
                >
                  Submit for Review
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      )}
        </Container>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;