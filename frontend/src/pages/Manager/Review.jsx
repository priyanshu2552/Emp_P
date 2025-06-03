import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
  Collapse,
  Button
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  SupervisorAccount as ManagerIcon,
  Event as DateIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  People as PeopleIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import ManagerLayout from '../../components/Layout/ManagerLayout';

const API_BASE = 'http://localhost:5000/api/manager';

const ManagerReviewDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const token = localStorage.getItem('token');
  
  const [employees, setEmployees] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [expandedReview, setExpandedReview] = useState(false);
  const [showTeamMembers, setShowTeamMembers] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    weekStartDate: '',
    weekEndDate: '',
    accomplishments: '',
    feedback: '',
    rating: 3,
  });

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data.employees)) setEmployees(data.employees);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setReviews(data.reviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const fetchEmployeeDetails = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/employee/details/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSelectedEmployee(data.employee);
    } catch (err) {
      console.error('Error fetching employee details:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      ...formData,
      accomplishments: formData.accomplishments.split(',').map((item) => item.trim()),
    };

    try {
      const res = await fetch(`${API_BASE}/review/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Review submitted successfully!');
        fetchReviews();
        resetForm();
      } else {
        alert('Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      weekStartDate: '',
      weekEndDate: '',
      accomplishments: '',
      feedback: '',
      rating: 3,
    });
    setOpenDialog(false);
  };

  const renderRatingStars = (rating) => {
    return (
      <Box display="flex" alignItems="center">
        {[...Array(5)].map((_, i) => (
          i < rating ? <StarIcon color="warning" key={i} /> : <StarBorderIcon color="disabled" key={i} />
        ))}
      </Box>
    );
  };

  return (
    <ManagerLayout>
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        {/* Reviews Section */}
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              Performance Reviews
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              New Review
            </Button>
          </Box>

          {reviews.length === 0 ? (
            <Typography variant="body1" textAlign="center" p={2}>
              No reviews submitted yet.
            </Typography>
          ) : (
            reviews.map((review) => (
              <Card key={review._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">
                      {review.employeeId?.name}
                    </Typography>
                    <Chip
                      label={new Date(review.weekStartDate).toLocaleDateString()}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {new Date(review.weekStartDate).toLocaleDateString()} -{' '}
                    {new Date(review.weekEndDate).toLocaleDateString()}
                  </Typography>
                  
                  <Box my={1}>
                    {renderRatingStars(review.rating)}
                  </Box>
                  
                  <Typography variant="body1" gutterBottom>
                    <strong>Feedback:</strong> {review.feedback}
                  </Typography>
                  
                  <Accordion expanded={expandedReview === review._id} onChange={() => setExpandedReview(expandedReview === review._id ? null : review._id)}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Accomplishments</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {review.accomplishments.map((a, i) => (
                          <ListItem key={i}>
                            <ListItemText primary={`• ${a}`} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            ))
          )}
        </Paper>

        {/* Team Members Section */}
        <Box sx={{ mb: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setShowTeamMembers(!showTeamMembers)}
            startIcon={showTeamMembers ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            endIcon={<PeopleIcon />}
          >
            {showTeamMembers ? 'Hide Team Members' : 'Show Team Members'}
          </Button>
          
          <Collapse in={showTeamMembers}>
            <Paper elevation={3} sx={{ p: 2, mt: 1 }}>
              <Typography variant="h6" gutterBottom>
                Team Members
              </Typography>
              <List>
                {employees.map((employee) => (
                  <Accordion key={employee._id} elevation={0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <ListItemAvatar>
                        <Avatar src={employee.image || '/default-avatar.png'} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={employee.name}
                        secondary={employee.role}
                      />
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        <ListItem>
                          <ListItemAvatar>
                            <EmailIcon color="primary" />
                          </ListItemAvatar>
                          <ListItemText primary={employee.email} />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <PhoneIcon color="primary" />
                          </ListItemAvatar>
                          <ListItemText primary={employee.contact || 'Not provided'} />
                        </ListItem>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                          onClick={() => fetchEmployeeDetails(employee._id)}
                        >
                          View Details
                        </Button>
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </List>
            </Paper>
          </Collapse>
        </Box>

        {/* Employee Details Dialog */}
        <Dialog open={Boolean(selectedEmployee)} onClose={() => setSelectedEmployee(null)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              Employee Details
              <IconButton onClick={() => setSelectedEmployee(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedEmployee && (
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={selectedEmployee.image || '/default-avatar.png'} sx={{ width: 64, height: 64 }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={selectedEmployee.name}
                    secondary={selectedEmployee.role}
                    primaryTypographyProps={{ variant: 'h6' }}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemAvatar>
                    <EmailIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText primary={selectedEmployee.email} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <PhoneIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText primary={selectedEmployee.contact || 'Not provided'} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <HomeIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText primary={selectedEmployee.address || 'Not provided'} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <ManagerIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText primary={`Manager: ${selectedEmployee.manager || 'Not assigned'}`} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <DateIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={`Joined: ${selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : 'N/A'}`} 
                  />
                </ListItem>
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedEmployee(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Review Form Dialog */}
        <Dialog open={openDialog} onClose={resetForm} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              Create New Review
              <IconButton onClick={resetForm}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="employee-select-label">Employee</InputLabel>
                    <Select
                      labelId="employee-select-label"
                      value={formData.employeeId}
                      label="Employee"
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      required
                    >
                      {employees.map((emp) => (
                        <MenuItem key={emp._id} value={emp._id}>
                          {emp.name} ({emp.email})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Week Start Date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.weekStartDate}
                    onChange={(e) => setFormData({ ...formData, weekStartDate: e.target.value })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Week End Date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.weekEndDate}
                    onChange={(e) => setFormData({ ...formData, weekEndDate: e.target.value })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Accomplishments (comma separated)"
                    value={formData.accomplishments}
                    onChange={(e) => setFormData({ ...formData, accomplishments: e.target.value })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Feedback"
                    value={formData.feedback}
                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Rating</InputLabel>
                    <Select
                      value={formData.rating}
                      label="Rating"
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      required
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num} {num === 1 ? 'star' : 'stars'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetForm}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              disabled={
                !formData.employeeId || 
                !formData.weekStartDate || 
                !formData.weekEndDate || 
                !formData.accomplishments || 
                !formData.feedback
              }
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ManagerLayout>
  );
};

export default ManagerReviewDashboard;