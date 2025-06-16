import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Paper, Tab, Tabs,
  CircularProgress, Button, Grid, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Rating, FormControl, FormLabel,
  FormGroup, FormControlLabel, Checkbox,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Select,
  MenuItem, InputLabel, TextareaAutosize, Accordion,
  AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  Assignment, CheckCircle, HourglassEmpty,
  Error, Send, Visibility, Edit, Add, Delete,
  ExpandMore
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import DashboardLayout from '../../components/Layout/EmployeeLayout';
const AppraisalsSection = () => {
  const [tabValue, setTabValue] = useState(0);
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('view');
  const { enqueueSnackbar } = useSnackbar();

  // Form states
  const [formData, setFormData] = useState({
    workItems: [{ description: '', completionStatus: 'not-started', codeQualityRating: 3 }],
    goals: [{ description: '', achieved: false, rating: 3 }],
    keyResults: [{ description: '', deliveredOnTime: true, qualityRating: 3 }],
    additionalComments: '',
    selfRating: 3,
    finalComments: ''
  });

  const statusColors = {
    'draft': 'default',
    'sent-to-employee': 'info',
    'submitted-by-employee': 'primary',
    'reviewed-by-manager': 'success',
    'rejected': 'error'
  };

  useEffect(() => {
    fetchAppraisals();
  }, []); const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };



  const fetchAppraisals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/employees/appraisals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppraisals(response.data);
      setLoading(false);
    } catch (error) {
      enqueueSnackbar('Failed to fetch appraisals', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleViewAppraisal = (appraisal, type = 'view') => {
    setSelectedAppraisal(appraisal);

    // Only allow editing if status is 'sent-to-employee'
    if (type === 'edit' && appraisal.status === 'sent-to-employee') {
      setDialogType('edit');
      setFormData({
        workItems: appraisal.workItems || [],
        goals: appraisal.goals || [],
        keyResults: appraisal.keyResults || [],
        additionalComments: appraisal.additionalComments || '',
        selfRating: appraisal.employeeSubmission?.selfRating || 3,
        finalComments: appraisal.employeeSubmission?.finalComments || ''
      });
    } else {
      setDialogType('view');
    }

    setOpenDialog(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/employees/appraisals/${selectedAppraisal._id}/submit`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      enqueueSnackbar('Appraisal submitted successfully', { variant: 'success' });
      fetchAppraisals();
      setOpenDialog(false);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Submission failed', { variant: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayItemChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index][field] = value;
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName, template) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], template]
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const renderWorkItems = () => (

    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Quality Rating</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {formData.workItems.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextField
                  fullWidth
                  multiline
                  value={item.description}
                  onChange={(e) => handleArrayItemChange('workItems', index, 'description', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={item.completionStatus}
                  onChange={(e) => handleArrayItemChange('workItems', index, 'completionStatus', e.target.value)}
                >
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="not-started">Not Started</MenuItem>
                  <MenuItem value="delayed">Delayed</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <Rating
                  value={item.codeQualityRating}
                  onChange={(_, newValue) => handleArrayItemChange('workItems', index, 'codeQualityRating', newValue)}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => removeArrayItem('workItems', index)}>
                  <Delete color="error" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        startIcon={<Add />}
        onClick={() => addArrayItem('workItems', {
          description: '',
          completionStatus: 'not-started',
          codeQualityRating: 3
        })}
        sx={{ mt: 1 }}
      >
        Add Work Item
      </Button>
    </TableContainer>
  );

  const renderGoals = () => (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell>Achieved</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {formData.goals.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextField
                  fullWidth
                  multiline
                  value={item.description}
                  onChange={(e) => handleArrayItemChange('goals', index, 'description', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={item.achieved}
                  onChange={(e) => handleArrayItemChange('goals', index, 'achieved', e.target.checked)}
                />
              </TableCell>
              <TableCell>
                <Rating
                  value={item.rating}
                  onChange={(_, newValue) => handleArrayItemChange('goals', index, 'rating', newValue)}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => removeArrayItem('goals', index)}>
                  <Delete color="error" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        startIcon={<Add />}
        onClick={() => addArrayItem('goals', {
          description: '',
          achieved: false,
          rating: 3
        })}
        sx={{ mt: 1 }}
      >
        Add Goal
      </Button>
    </TableContainer>
  );

  const renderKeyResults = () => (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell>Delivered On Time</TableCell>
            <TableCell>Quality Rating</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {formData.keyResults.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextField
                  fullWidth
                  multiline
                  value={item.description}
                  onChange={(e) => handleArrayItemChange('keyResults', index, 'description', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={item.deliveredOnTime}
                  onChange={(e) => handleArrayItemChange('keyResults', index, 'deliveredOnTime', e.target.checked)}
                />
              </TableCell>
              <TableCell>
                <Rating
                  value={item.qualityRating}
                  onChange={(_, newValue) => handleArrayItemChange('keyResults', index, 'qualityRating', newValue)}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => removeArrayItem('keyResults', index)}>
                  <Delete color="error" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        startIcon={<Add />}
        onClick={() => addArrayItem('keyResults', {
          description: '',
          deliveredOnTime: true,
          qualityRating: 3
        })}
        sx={{ mt: 1 }}
      >
        Add Key Result
      </Button>
    </TableContainer>
  );

  const renderAppraisalForm = () => (
    <form onSubmit={handleFormSubmit}>
      <Typography variant="h6" gutterBottom>Work Items</Typography>
      {renderWorkItems()}

      <Typography variant="h6" gutterBottom>Goals</Typography>
      {renderGoals()}

      <Typography variant="h6" gutterBottom>Key Results</Typography>
      {renderKeyResults()}

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Additional Comments"
        name="additionalComments"
        value={formData.additionalComments}
        onChange={handleInputChange}
        sx={{ mb: 3 }}
      />

      <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
        <FormLabel component="legend">Self Rating</FormLabel>
        <Rating
          name="selfRating"
          value={formData.selfRating}
          onChange={(_, newValue) => handleInputChange({ target: { name: 'selfRating', value: newValue } })}
          size="large"
        />
      </FormControl>

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Final Comments"
        name="finalComments"
        value={formData.finalComments}
        onChange={handleInputChange}
        sx={{ mb: 3 }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          startIcon={<Send />}
        >
          Submit Appraisal
        </Button>
      </Box>
    </form>
  );

  const renderAppraisalDetails = () => {
    if (!selectedAppraisal) return null;

    return (
      <DashboardLayout>
      <Box>
        <Typography variant="h6" gutterBottom>
          {selectedAppraisal.period} {selectedAppraisal.year} Appraisal
        </Typography>
        <Chip
          label={selectedAppraisal.status.replace(/-/g, ' ')}
          color={statusColors[selectedAppraisal.status]}
          sx={{ mb: 2 }}
        />

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Work Items</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Quality</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedAppraisal.workItems?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.completionStatus}</TableCell>
                      <TableCell>
                        <Rating value={item.codeQualityRating} readOnly />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Goals</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Achieved</TableCell>
                    <TableCell>Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedAppraisal.goals?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        {item.achieved ? <CheckCircle color="success" /> : <Error color="error" />}
                      </TableCell>
                      <TableCell>
                        <Rating value={item.rating} readOnly />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Key Results</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>On Time</TableCell>
                    <TableCell>Quality</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedAppraisal.keyResults?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        {item.deliveredOnTime ? <CheckCircle color="success" /> : <Error color="error" />}
                      </TableCell>
                      <TableCell>
                        <Rating value={item.qualityRating} readOnly />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>

        {selectedAppraisal.additionalComments && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Additional Comments</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {selectedAppraisal.additionalComments}
            </Typography>
          </Box>
        )}

        {selectedAppraisal.employeeSubmission && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Employee Submission</Typography>
            <Typography variant="body2">
              Submitted on: {format(new Date(selectedAppraisal.employeeSubmission.submittedAt), 'PPpp')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="subtitle1" sx={{ mr: 1 }}>Self Rating:</Typography>
              <Rating value={selectedAppraisal.employeeSubmission.selfRating} readOnly />
            </Box>
            {selectedAppraisal.employeeSubmission.finalComments && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle1">Final Comments</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {selectedAppraisal.employeeSubmission.finalComments}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {selectedAppraisal.managerReview && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Manager Review</Typography>
            <Typography variant="body2">
              Reviewed on: {format(new Date(selectedAppraisal.managerReview.reviewedAt), 'PPpp')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="subtitle1" sx={{ mr: 1 }}>Overall Rating:</Typography>
              <Rating value={selectedAppraisal.managerReview.overallRating} readOnly />
            </Box>
            {selectedAppraisal.managerReview.feedback && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle1">Feedback</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {selectedAppraisal.managerReview.feedback}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
      </DashboardLayout>
    );
  };

  const renderAppraisalCard = (appraisal) => (
    <Paper sx={{ p: 2, mb: 2 }} key={appraisal._id}>
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={12} md={3}>
          <Typography variant="h6">
            {appraisal.period} {appraisal.year}
          </Typography>
          <Chip
            label={appraisal.status.replace(/-/g, ' ')}
            color={statusColors[appraisal.status]}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="body2">
            Created: {format(new Date(appraisal.createdAt), 'PP')}
          </Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="body2">
            Manager: {appraisal.manager?.name || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={3} sx={{ textAlign: 'right' }}>
          {appraisal.status === 'sent-to-employee' && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => handleViewAppraisal(appraisal, 'edit')}
              sx={{ mr: 1 }}
            >
              Complete
            </Button>
          )}
          {/* Always show View button regardless of status */}
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => handleViewAppraisal(appraisal)}
          >
            View
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
  return (
    <DashboardLayout>
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Performance Appraisals
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Current Appraisals" />
        <Tab label="Past Appraisals" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {tabValue === 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Active Appraisals
              </Typography>
              {appraisals.filter(a => ['sent-to-employee', 'submitted-by-employee'].includes(a.status)).length > 0 ? (
                appraisals
                  .filter(a => ['sent-to-employee', 'submitted-by-employee'].includes(a.status))
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map(renderAppraisalCard)
              ) : (
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  No active appraisals at this time.
                </Typography>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Appraisal History
              </Typography>
              {appraisals.filter(a => !['sent-to-employee', 'submitted-by-employee'].includes(a.status)).length > 0 ? (
                appraisals
                  .filter(a => !['sent-to-employee', 'submitted-by-employee'].includes(a.status))
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map(renderAppraisalCard)
              ) : (
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  No past appraisals found.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedAppraisal?.period} {selectedAppraisal?.year} Appraisal
          <Chip
            label={selectedAppraisal?.status.replace(/-/g, ' ')}
            color={statusColors[selectedAppraisal?.status]}
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent dividers>
          {dialogType === 'edit' ? (
            renderAppraisalForm()
          ) : (
            renderAppraisalDetails()
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {dialogType === 'edit' && (
            <Button
              variant="contained"
              onClick={handleFormSubmit}
              startIcon={<Send />}
            >
              Submit
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Container>
    </DashboardLayout>
  );
};

export default AppraisalsSection;