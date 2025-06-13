import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Paper,
  TextField, Rating, Alert, CircularProgress, Card, CardContent
} from '@mui/material';
import axios from 'axios';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';

const EmployeeDashboard = () => {
  const [appraisal, setAppraisal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppraisal = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/employees/appraisal', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAppraisal(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch appraisal');
      } finally {
        setLoading(false);
      }
    };
    fetchAppraisal();
  }, []);

  const initialValues = appraisal || {
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
        selfRating: Yup.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
        achievements: Yup.string().required('Achievements are required'),
        areasToImprove: Yup.string().required('Areas to improve are required')
      })
    ),
    additionalComments: Yup.string(),
    careerGoals: Yup.string()
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const url = appraisal
        ? 'http://localhost:5000/api/employees/appraisal'
        : 'http://localhost:5000/api/employees/appraisal';

      const method = appraisal ? 'put' : 'post';

      const { data } = await axios[method](url, values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setAppraisal(data);
      setSuccess('Appraisal saved successfully');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save appraisal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAppraisal = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/employees/appraisal/submit',
        {
          kras: values.kras.map(kra => ({
            name: kra.name,
            selfRating: kra.selfRating,
            achievements: kra.achievements,
            areasToImprove: kra.areasToImprove,
            kpis: kra.kpis.map(kpi => ({
              name: kpi.name,
              target: kpi.target,
              selfRating: kpi.selfRating
            }))
          })),
          additionalComments: values.additionalComments,
          careerGoals: values.careerGoals,
          period: appraisal?.period || 'Q1',
          year: appraisal?.year || new Date().getFullYear()
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Appraisal submitted successfully');
      setError('');
      navigate('/employee');
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit appraisal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CircularProgress />;

  if (appraisal?.status === 'submitted' || appraisal?.status === 'reviewed') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Appraisal - {appraisal.period} {appraisal.year}
        </Typography>

        {appraisal.status === 'reviewed' && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Manager Feedback</Typography>
              <Typography>{appraisal.managerFeedback}</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>Action Plan</Typography>
              <Typography>{appraisal.actionPlan}</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>Overall Rating: {appraisal.overallRating}/5</Typography>
            </CardContent>
          </Card>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, isSubmitting }) => (
            <Form>
              <FieldArray name="kras">
                {() => (
                  <Box>
                    {values.kras.map((kra, kraIndex) => (
                      <Paper key={kraIndex} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>{kra.name}</Typography>

                        <Box sx={{ mb: 2 }}>
                          <Typography>Self Rating</Typography>
                          <Rating
                            name={`kras[${kraIndex}].selfRating`}
                            value={Number(kra.selfRating)}
                            precision={1}
                            readOnly
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography>Achievements</Typography>
                          <Typography>{kra.achievements}</Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography>Areas to Improve</Typography>
                          <Typography>{kra.areasToImprove}</Typography>
                        </Box>

                        <Typography variant="subtitle1" sx={{ mt: 2 }}>KPIs</Typography>
                        {kra.kpis.map((kpi, kpiIndex) => (
                          <Box key={kpiIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ flex: 1 }}>{kpi.name} (Target: {kpi.target})</Typography>
                            <Rating
                              name={`kras[${kraIndex}].kpis[${kpiIndex}].selfRating`}
                              value={Number(kpi.selfRating)}
                              precision={1}
                              readOnly
                            />
                          </Box>
                        ))}
                      </Paper>
                    ))}
                  </Box>
                )}
              </FieldArray>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/employee')}
                >
                  Back
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {appraisal ? 'Update Appraisal' : 'Create New Appraisal'} - {appraisal?.period || 'Q1'} {appraisal?.year || new Date().getFullYear()}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
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
          setSubmitting
        }) => (
          <Form>
            <FieldArray name="kras">
              {() => (
                <Box>
                  {values.kras.map((kra, kraIndex) => (
                    <Paper key={kraIndex} sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h6" gutterBottom>{kra.name}</Typography>

                      <Box sx={{ mb: 2 }}>
                        <Typography>Self Rating</Typography>
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
                          <Typography color="error">{errors.kras[kraIndex].selfRating}</Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography>Achievements</Typography>
                        <TextField
                          name={`kras[${kraIndex}].achievements`}
                          value={values.kras[kraIndex].achievements}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          fullWidth
                          multiline
                          rows={3}
                          error={Boolean(errors.kras?.[kraIndex]?.achievements && touched.kras?.[kraIndex]?.achievements)}
                          helperText={errors.kras?.[kraIndex]?.achievements && touched.kras?.[kraIndex]?.achievements ? errors.kras[kraIndex].achievements : ''}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography>Areas to Improve</Typography>
                        <TextField
                          name={`kras[${kraIndex}].areasToImprove`}
                          value={values.kras[kraIndex].areasToImprove}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          fullWidth
                          multiline
                          rows={3}
                          error={Boolean(errors.kras?.[kraIndex]?.areasToImprove && touched.kras?.[kraIndex]?.areasToImprove)}
                          helperText={errors.kras?.[kraIndex]?.areasToImprove && touched.kras?.[kraIndex]?.areasToImprove ? errors.kras[kraIndex].areasToImprove : ''}
                        />
                      </Box>

                      <Typography variant="subtitle1" sx={{ mt: 2 }}>KPIs</Typography>
                      {kra.kpis.map((kpi, kpiIndex) => (
                        <Box key={kpiIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography sx={{ flex: 1 }}>{kpi.name} (Target: {kpi.target})</Typography>
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
                        </Box>
                      ))}
                    </Paper>
                  ))}
                </Box>
              )}
            </FieldArray>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Additional Comments</Typography>
              <TextField
                name="additionalComments"
                value={values.additionalComments}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                multiline
                rows={3}
              />
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Career Goals</Typography>
              <TextField
                name="careerGoals"
                value={values.careerGoals}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                multiline
                rows={3}
              />
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Save Draft'}
              </Button>

              <Button
                variant="contained"
                color="success"
                type="button"
                onClick={async () => {
                  await submitForm();
                  if (Object.keys(errors).length === 0) {
                    handleSubmitAppraisal(values, { setSubmitting });
                  }
                }}
                disabled={isSubmitting || Object.keys(errors).length > 0}
              >
                Submit for Review
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default EmployeeDashboard;