import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, Paper, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Alert, CircularProgress,
  TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, Rating,
  InputLabel, Select, List, ListItem, ListItemText,
  Chip, Divider, Tabs, Tab, Card, CardContent,
  Grid, Avatar, Accordion, AccordionSummary, 
  AccordionDetails, IconButton, Tooltip
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  EmojiEvents as EmojiEventsIcon,
  Chat as ChatIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  HourglassEmpty as HourglassEmptyIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === 'draft' && {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[800],
  }),
  ...(status === 'sent-to-employee' && {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.dark,
  }),
  ...(status === 'submitted-by-employee' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  }),
  ...(status === 'reviewed-by-manager' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  }),
}));

const AdminAppraisalDashboard = () => {
  const theme = useTheme();
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [tabValue, setTabValue] = useState('all');
  const [filter, setFilter] = useState({
    period: '',
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchAppraisals();
  }, [filter, tabValue]);

  const fetchAppraisals = async () => {
    try {
      setLoading(true);
      const params = { ...filter };
      
      // Add status filter based on tab selection
      if (tabValue !== 'all') {
        params.status = tabValue;
      }
      
      const { data } = await axios.get('http://localhost:5000/api/admin/appraisals', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppraisals(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch appraisals');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (appraisal) => {
    setSelectedAppraisal(appraisal);
    setOpenDialog(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
        return <HourglassEmptyIcon fontSize="small" />;
      case 'sent-to-employee':
        return <PendingIcon fontSize="small" />;
      case 'submitted-by-employee':
        return <CheckCircleIcon fontSize="small" color="warning" />;
      case 'reviewed-by-manager':
        return <DoneAllIcon fontSize="small" color="success" />;
      default:
        return null;
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Appraisal Monitoring Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Period</InputLabel>
                <Select
                  value={filter.period}
                  onChange={(e) => setFilter({ ...filter, period: e.target.value })}
                  label="Period"
                >
                  <MenuItem value="">All Periods</MenuItem>
                  <MenuItem value="Q1">Q1</MenuItem>
                  <MenuItem value="Q2">Q2</MenuItem>
                  <MenuItem value="Q3">Q3</MenuItem>
                  <MenuItem value="Q4">Q4</MenuItem>
                  <MenuItem value="Annual">Annual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Year"
                type="number"
                value={filter.year}
                onChange={(e) => setFilter({ ...filter, year: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button 
                variant="contained" 
                fullWidth
                onClick={fetchAppraisals}
                sx={{ height: '56px' }}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab label="All" value="all" />
        <Tab label="Draft" value="draft" icon={getStatusIcon('draft')} />
        <Tab label="Sent to Employee" value="sent-to-employee" icon={getStatusIcon('sent-to-employee')} />
        <Tab label="Submitted" value="submitted-by-employee" icon={getStatusIcon('submitted-by-employee')} />
        <Tab label="Reviewed" value="reviewed-by-manager" icon={getStatusIcon('reviewed-by-manager')} />
      </Tabs>
      
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Manager</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appraisals.length > 0 ? (
              appraisals.map((appraisal) => (
                <TableRow key={appraisal._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                        {appraisal.employee?.name?.charAt(0) || 'E'}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={500}>{appraisal.employee?.name || 'N/A'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appraisal.employee?.department || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: theme.palette.secondary.main }}>
                        {appraisal.manager?.name?.charAt(0) || 'M'}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={500}>{appraisal.manager?.name || 'N/A'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appraisal.manager?.role || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={500}>
                      {appraisal.period} {appraisal.year}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(appraisal.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      label={appraisal.status.replace(/-/g, ' ')}
                      status={appraisal.status}
                      icon={getStatusIcon(appraisal.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(appraisal.updatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewDetails(appraisal)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No appraisals found matching your criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Appraisal Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon sx={{ mr: 1 }} />
            Appraisal Details
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedAppraisal && (
            <Box sx={{ mt: 2 }}>
              {/* Header Section */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Employee Information</Typography>
                      </Box>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Name" 
                            secondary={selectedAppraisal.employee?.name || 'N/A'} 
                            secondaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Employee ID" 
                            secondary={selectedAppraisal.employee?.employeeId || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Department" 
                            secondary={selectedAppraisal.employee?.department || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Contact" 
                            secondary={selectedAppraisal.employee?.contact || 'N/A'} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon color="secondary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Manager Information</Typography>
                      </Box>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Name" 
                            secondary={selectedAppraisal.manager?.name || 'N/A'} 
                            secondaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Employee ID" 
                            secondary={selectedAppraisal.manager?.employeeId || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Department" 
                            secondary={selectedAppraisal.manager?.department || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Role" 
                            secondary={selectedAppraisal.manager?.role || 'N/A'} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <ListItemText 
                        primary="Appraisal Period" 
                        secondary={`${selectedAppraisal.period} ${selectedAppraisal.year}`} 
                        secondaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ListItemText 
                        primary="Status" 
                        secondary={
                          <StatusChip
                            label={selectedAppraisal.status.replace(/-/g, ' ')}
                            status={selectedAppraisal.status}
                            icon={getStatusIcon(selectedAppraisal.status)}
                          />
                        } 
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ListItemText 
                        primary="Last Updated" 
                        secondary={new Date(selectedAppraisal.updatedAt).toLocaleString()} 
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              {/* Work Items Section */}
              {selectedAppraisal.workItems && selectedAppraisal.workItems.length > 0 && (
                <Accordion defaultExpanded sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WorkIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="h6">Work Items</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {selectedAppraisal.workItems.map((item, index) => (
                        <Grid item xs={12} key={index}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom>
                                {item.description}
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                  <ListItemText 
                                    primary="Completion Status" 
                                    secondary={
                                      <Chip 
                                        label={item.completionStatus} 
                                        size="small"
                                        color={
                                          item.completionStatus === 'completed' ? 'success' : 
                                          item.completionStatus === 'in-progress' ? 'warning' : 'error'
                                        }
                                      />
                                    } 
                                  />
                                </Grid>
                                {item.codeQualityRating && (
                                  <Grid item xs={12} md={4}>
                                    <ListItemText 
                                      primary="Code Quality" 
                                      secondary={
                                        <Rating 
                                          value={item.codeQualityRating} 
                                          precision={0.5} 
                                          readOnly 
                                        />
                                      } 
                                    />
                                  </Grid>
                                )}
                                {item.timelyDelivery !== undefined && (
                                  <Grid item xs={12} md={4}>
                                    <ListItemText 
                                      primary="Timely Delivery" 
                                      secondary={
                                        <Chip 
                                          label={item.timelyDelivery ? 'On Time' : 'Delayed'} 
                                          size="small"
                                          color={item.timelyDelivery ? 'success' : 'error'}
                                        />
                                      } 
                                    />
                                  </Grid>
                                )}
                              </Grid>
                              {item.challenges && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="body2">
                                    <strong>Challenges:</strong> {item.challenges}
                                  </Typography>
                                </Box>
                              )}
                              {item.learnings && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2">
                                    <strong>Learnings:</strong> {item.learnings}
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}
              
              {/* Goals Section */}
              {selectedAppraisal.goals && selectedAppraisal.goals.length > 0 && (
                <Accordion defaultExpanded sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmojiEventsIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="h6">Goals</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {selectedAppraisal.goals.map((goal, index) => (
                        <Grid item xs={12} key={index}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom>
                                {goal.description}
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                  <ListItemText 
                                    primary="Achieved" 
                                    secondary={
                                      <Chip 
                                        label={goal.achieved ? 'Yes' : 'No'} 
                                        size="small"
                                        color={goal.achieved ? 'success' : 'error'}
                                      />
                                    } 
                                  />
                                </Grid>
                                {goal.rating && (
                                  <Grid item xs={12} md={4}>
                                    <ListItemText 
                                      primary="Rating" 
                                      secondary={
                                        <Rating 
                                          value={goal.rating} 
                                          precision={0.5} 
                                          readOnly 
                                        />
                                      } 
                                    />
                                  </Grid>
                                )}
                              </Grid>
                              {goal.evidence && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="body2">
                                    <strong>Evidence:</strong> {goal.evidence}
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}
              
              {/* Key Results Section */}
              {selectedAppraisal.keyResults && selectedAppraisal.keyResults.length > 0 && (
                <Accordion defaultExpanded sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WorkIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="h6">Key Results</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell align="center">Delivered On Time</TableCell>
                            <TableCell align="center">Quality Rating</TableCell>
                            <TableCell>Comments</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedAppraisal.keyResults.map((result, index) => (
                            <TableRow key={index}>
                              <TableCell>{result.description}</TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={result.deliveredOnTime ? 'Yes' : 'No'} 
                                  size="small"
                                  color={result.deliveredOnTime ? 'success' : 'error'}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Rating value={result.qualityRating} precision={0.5} readOnly />
                              </TableCell>
                              <TableCell>{result.comments || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              )}
              
              {/* Employee Submission */}
              {selectedAppraisal.employeeSubmission && (
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="h6">Employee Submission</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Card variant="outlined">
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <ListItemText 
                              primary="Submitted At" 
                              secondary={
                                selectedAppraisal.employeeSubmission.submittedAt ? 
                                new Date(selectedAppraisal.employeeSubmission.submittedAt).toLocaleString() : 
                                'Not submitted'
                              } 
                            />
                          </Grid>
                          {selectedAppraisal.employeeSubmission.selfRating && (
                            <Grid item xs={12} md={6}>
                              <ListItemText 
                                primary="Self Rating" 
                                secondary={
                                  <Rating 
                                    value={selectedAppraisal.employeeSubmission.selfRating} 
                                    precision={0.5} 
                                    readOnly 
                                  />
                                } 
                              />
                            </Grid>
                          )}
                        </Grid>
                        {selectedAppraisal.employeeSubmission.finalComments && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Final Comments
                            </Typography>
                            <Typography variant="body2">
                              {selectedAppraisal.employeeSubmission.finalComments}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </AccordionDetails>
                </Accordion>
              )}
              
              {/* Manager Review */}
              {selectedAppraisal.managerReview && (
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ChatIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="h6">Manager Review</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Card variant="outlined">
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <ListItemText 
                              primary="Reviewed At" 
                              secondary={
                                selectedAppraisal.managerReview.reviewedAt ? 
                                new Date(selectedAppraisal.managerReview.reviewedAt).toLocaleString() : 
                                'Not reviewed'
                              } 
                            />
                          </Grid>
                          {selectedAppraisal.managerReview.overallRating && (
                            <Grid item xs={12} md={6}>
                              <ListItemText 
                                primary="Overall Rating" 
                                secondary={
                                  <Rating 
                                    value={selectedAppraisal.managerReview.overallRating} 
                                    precision={0.5} 
                                    readOnly 
                                  />
                                } 
                              />
                            </Grid>
                          )}
                        </Grid>
                        {selectedAppraisal.managerReview.feedback && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Feedback
                            </Typography>
                            <Typography variant="body2">
                              {selectedAppraisal.managerReview.feedback}
                            </Typography>
                          </Box>
                        )}
                        {selectedAppraisal.managerReview.actionItems && 
                         selectedAppraisal.managerReview.actionItems.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Action Items
                            </Typography>
                            <List dense>
                              {selectedAppraisal.managerReview.actionItems.map((item, index) => (
                                <ListItem key={index}>
                                  <ListItemText primary={item} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </AccordionDetails>
                </Accordion>
              )}
              
              {/* Additional Comments */}
              {selectedAppraisal.additionalComments && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Additional Comments
                    </Typography>
                    <Typography variant="body2">
                      {selectedAppraisal.additionalComments}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminAppraisalDashboard;