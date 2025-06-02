import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  IconButton,
  Collapse
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import ManagerLayout from '../../components/Layout/ManagerLayout';

const ManagerProfilePage = () => {
    const [manager, setManager] = useState({});
    const [employees, setEmployees] = useState(null);
    const [showEmployeeList, setShowEmployeeList] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [totalPendingAppraisals, setTotalPendingAppraisals] = useState(null); // Changed from 0 to null
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [loadingEmployeeDetails, setLoadingEmployeeDetails] = useState(false);
    const [loadingAppraisalsCount, setLoadingAppraisalsCount] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const axiosInstance = axios.create({
        baseURL: 'http://localhost:5000/api/manager',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });

    useEffect(() => {
        fetchManagerProfile();
        fetchPendingAppraisalsCount();
    }, []);

    const fetchManagerProfile = async () => {
        try {
            setError(null);
            setLoadingProfile(true);
            const res = await axiosInstance.get('/profile');
            setManager(res.data.manager);
            setFormData(res.data.manager);
        } catch (err) {
            setError('Error fetching manager profile');
        } finally {
            setLoadingProfile(false);
        }
    };

    const fetchPendingAppraisalsCount = async () => {
        try {
            setLoadingAppraisalsCount(true);
            const res = await axiosInstance.get('/pending-appraisals-count');
            setTotalPendingAppraisals(res.data.count || 0);
        } catch (err) {
            setTotalPendingAppraisals(0);
        } finally {
            setLoadingAppraisalsCount(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            setError(null);
            setLoadingEmployees(true);
            const res = await axiosInstance.get('/employees');
            setEmployees(res.data.employees);
            setShowEmployeeList(true);
        } catch (err) {
            setError('Error fetching employees');
            setShowEmployeeList(false);
        } finally {
            setLoadingEmployees(false);
        }
    };

    const toggleEmployeeList = () => {
        if (showEmployeeList) {
            setShowEmployeeList(false);
        } else {
            fetchEmployees();
        }
    };

    const fetchEmployeeDetails = async (id) => {
        try {
            setError(null);
            setLoadingEmployeeDetails(true);
            const res = await axiosInstance.get(`/employee/${id}`);
            setSelectedEmployee(res.data.employee);
        } catch (err) {
            setError('Error fetching employee details');
        } finally {
            setLoadingEmployeeDetails(false);
        }
    };

    const updateProfile = async () => {
        if (!formData.name || formData.name.trim() === '') {
            alert('Name cannot be empty');
            return;
        }

        try {
            setError(null);
            await axiosInstance.put('/update-profile', {
                name: formData.name,
                contact: formData.contact,
                address: formData.address,
            });
            alert('Profile updated successfully');
            setEditMode(false);
            fetchManagerProfile();
        } catch (err) {
            setError('Error updating profile');
        }
    };

    const goToAppraisals = () => {
        navigate('/manager/appraisal');
    };

    return (
        <ManagerLayout>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Manager Profile
                </Typography>

                {error && (
                    <Typography color="error" paragraph>
                        {error}
                    </Typography>
                )}

                <Paper sx={{ p: 3, mb: 3 }}>
                    {loadingProfile ? (
                        <Box display="flex" justifyContent="center">
                            <CircularProgress />
                        </Box>
                    ) : !editMode ? (
                        <Box>
                            <Typography variant="body1" paragraph>
                                <strong>Name:</strong> {manager.name || '-'}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                <strong>Email:</strong> {manager.email || '-'}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                <strong>Role:</strong> {manager.role || '-'}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                <strong>Contact:</strong> {manager.contact || '-'}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                <strong>Address:</strong> {manager.address || '-'}
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={() => setEditMode(true)}
                                sx={{ mt: 2 }}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    ) : (
                        <Box component="form">
                            <TextField
                                label="Name"
                                fullWidth
                                margin="normal"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <TextField
                                label="Contact"
                                fullWidth
                                margin="normal"
                                value={formData.contact || ''}
                                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                            />
                            <TextField
                                label="Address"
                                fullWidth
                                margin="normal"
                                multiline
                                rows={3}
                                value={formData.address || ''}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                            <Box sx={{ mt: 2 }}>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={updateProfile}
                                    sx={{ mr: 2 }}
                                >
                                    Save
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => setEditMode(false)}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Paper>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <Button
                        variant={showEmployeeList ? "contained" : "outlined"}
                        onClick={toggleEmployeeList}
                        disabled={loadingEmployees}
                        endIcon={showEmployeeList ? <ExpandLess /> : <ExpandMore />}
                    >
                        {loadingEmployees 
                            ? 'Loading...' 
                            : employees === null 
                                ? 'View Employees' 
                                : `Employees (${employees.length})`
                        }
                    </Button>
                    
                    <Button
                        variant="outlined"
                        onClick={goToAppraisals}
                        disabled={loadingAppraisalsCount}
                    >
                        {loadingAppraisalsCount 
                            ? 'Loading...' 
                            : totalPendingAppraisals === null 
                                ? 'Pending Appraisals' 
                                : `Pending Appraisals (${totalPendingAppraisals})`
                        }
                    </Button>
                </Box>

                <Collapse in={showEmployeeList}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">
                                Employees List
                            </Typography>
                            <Button 
                                size="small" 
                                onClick={() => setShowEmployeeList(false)}
                            >
                                Close
                            </Button>
                        </Box>
                        {employees === null ? (
                            <Box display="flex" justifyContent="center">
                                <CircularProgress />
                            </Box>
                        ) : employees.length === 0 ? (
                            <Typography>No employees found.</Typography>
                        ) : (
                            <List>
                                {employees.map(emp => (
                                    <ListItem 
                                        key={emp._id}
                                        button
                                        onClick={() => fetchEmployeeDetails(emp._id)}
                                    >
                                        <ListItemText 
                                            primary={emp.name} 
                                            secondary={emp.email} 
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Collapse>

                <Dialog
                    open={Boolean(selectedEmployee)}
                    onClose={() => setSelectedEmployee(null)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Employee Details</DialogTitle>
                    <DialogContent>
                        {loadingEmployeeDetails ? (
                            <Box display="flex" justifyContent="center">
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Typography variant="body1" paragraph>
                                    <strong>Name:</strong> {selectedEmployee?.name || '-'}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    <strong>Email:</strong> {selectedEmployee?.email || '-'}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    <strong>Contact:</strong> {selectedEmployee?.contact || '-'}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    <strong>Address:</strong> {selectedEmployee?.address || '-'}
                                </Typography>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSelectedEmployee(null)}>Close</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ManagerLayout>
    );
};

export default ManagerProfilePage;