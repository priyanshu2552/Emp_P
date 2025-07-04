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
    ListItemAvatar,
    Avatar,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Collapse,
    Grid,
    Input,
    Snackbar,
    Alert,
    styled
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import ManagerLayout from '../../components/Layout/ManagerLayout';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const ManagerProfilePage = () => {
    const [manager, setManager] = useState({});
    const [employees, setEmployees] = useState(null);
    const [showEmployeeList, setShowEmployeeList] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [totalPendingAppraisals, setTotalPendingAppraisals] = useState(0);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [loadingEmployeeDetails, setLoadingEmployeeDetails] = useState(false);
    const [loadingAppraisalsCount, setLoadingAppraisalsCount] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const [userImage, setUserImage] = useState(user?.profileImage || '/default-avatar.png');
    const [snackbarState, setSnackbarState] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const navigate = useNavigate();

    const axiosInstance = axios.create({
        baseURL: 'http://localhost:5000/api/manager',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });

    const getProfileImageUrl = (userId) => {
        if (!userId) return '/default-avatar.png';
        return `http://localhost:5000/api/manager/${userId}/profile-image?${Date.now()}`;
    };

    const fetchManagerProfile = async () => {
        try {
            setLoadingProfile(true);
            const { data } = await axiosInstance.get('/profile');
            if (data.manager) {
                setManager(data.manager);
                setFormData(data.manager);
                if (data.manager._id) {
                    // Add timestamp to force refresh
                    setImagePreview(`http://localhost:5000/api/manager/${data.manager._id}/profile-image?${Date.now()}`);
                }
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            showSnackbar('Error fetching manager profile', 'error');
        } finally {
            setLoadingProfile(false);
        }
    };

    // Add this image upload handler
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const formData = new FormData();
            formData.append('profileImage', file);

            const { data } = await axiosInstance.put(
                '/profile/image',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (data.success) {
                // Update local storage
                localStorage.setItem('user', JSON.stringify(data.profile));

                // Force refresh the image with new timestamp
                setImagePreview(`http://localhost:5000/api/manager/${manager._id}/profile-image?${Date.now()}`);
                setUserImage(imagePreview);
                // Trigger layout update
                window.dispatchEvent(new Event('storage'));

                showSnackbar('Profile image updated successfully!', 'success');
            }
        } catch (err) {
            console.error('Upload error:', err);
            showSnackbar(err.response?.data?.message || 'Image upload failed', 'error');
        } finally {
            setUploadingImage(false);
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
            showSnackbar('Name cannot be empty', 'error');
            return;
        }

        try {
            setError(null);
            await axiosInstance.put('/update-profile', {
                name: formData.name,
                contact: formData.contact,
                address: formData.address,
            });
            showSnackbar('Profile updated successfully', 'success');
            setEditMode(false);
            fetchManagerProfile();
        } catch (err) {
            showSnackbar('Error updating profile', 'error');
        }
    };

    const fetchPendingAppraisalsCount = async () => {
        try {
            setLoadingAppraisalsCount(true);
            const res = await axiosInstance.get('/appraisal');
            const pending = res.data.filter(a => a.status === 'submitted').length;
            setTotalPendingAppraisals(pending);
        } catch (err) {
            setTotalPendingAppraisals(0);
        } finally {
            setLoadingAppraisalsCount(false);
        }
    };

    const goToAppraisals = () => {
        navigate('/manager/appraisal');
    };

    const showSnackbar = (message, severity) => {
        setSnackbarState({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbarState(prev => ({ ...prev, open: false }));
    };

    useEffect(() => {
        fetchManagerProfile();
        fetchPendingAppraisalsCount();
    }, []);
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
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <Box display="flex" flexDirection="column" alignItems="center">
                                    <Avatar
                                        src={userImage}
                                        sx={{ width: 150, height: 150, mb: 2 }}
                                        imgProps={{
                                            onError: (e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/default-avatar.png';
                                            }
                                        }}
                                    />
                                    <Typography variant="h6">{manager.name}</Typography>
                                    <Typography color="textSecondary">{manager.role}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={9}>
                                <Typography variant="body1" paragraph>
                                    <strong>Employee ID:</strong> {manager.EmployeeId || '-'}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    <strong>Department:</strong> {manager.Department || '-'}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    <strong>Email:</strong> {manager.email || '-'}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    <strong>Contact:</strong> {manager.contact || '-'}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    <strong>Address:</strong> {manager.address || '-'}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    <strong>Member Since:</strong> {new Date(manager.createdAt).toLocaleDateString()}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setEditMode(true)}
                                    sx={{ mt: 2 }}
                                >
                                    Edit Profile
                                </Button>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <Box display="flex" flexDirection="column" alignItems="center">
                                    <Avatar
                                        src={userImage}
                                        sx={{ width: 150, height: 150, mb: 2 }}
                                        imgProps={{
                                            onError: (e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/default-avatar.png';
                                            }
                                        }}
                                    />
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        disabled={uploadingImage}
                                        startIcon={uploadingImage ? <CircularProgress size={20} /> : null}
                                    >
                                        {uploadingImage ? 'Uploading...' : 'Change Photo'}
                                        <VisuallyHiddenInput
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </Button>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={9}>
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
                                        label="Employee ID"
                                        fullWidth
                                        margin="normal"
                                        value={formData.EmployeeId || ''}
                                        onChange={e => setFormData({ ...formData, EmployeeId: e.target.value })}
                                        disabled
                                    />
                                    <TextField
                                        label="Department"
                                        fullWidth
                                        margin="normal"
                                        value={formData.Department || ''}
                                        onChange={e => setFormData({ ...formData, Department: e.target.value })}
                                        disabled
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
                            </Grid>
                        </Grid>
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
                                        <ListItemAvatar>
                                            <Avatar
                                                src={emp._id ? `http://localhost:5000/api/employees/${emp._id}/profile-image?${Date.now()}` : '/default-avatar.png'}
                                            />
                                        </ListItemAvatar>
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
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Box display="flex" justifyContent="center">
                                        <Avatar
                                            src={selectedEmployee?._id ? `http://localhost:5000/api/employees/${selectedEmployee._id}/profile-image?${Date.now()}` : '/default-avatar.png'}
                                            sx={{ width: 100, height: 100 }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Typography variant="body1" paragraph>
                                        <strong>Name:</strong> {selectedEmployee?.name || '-'}
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        <strong>Employee ID:</strong> {selectedEmployee?.EmployeeId || '-'}
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        <strong>Department:</strong> {selectedEmployee?.Department || '-'}
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        <strong>Email:</strong> {selectedEmployee?.email || '-'}
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        <strong>Contact:</strong> {selectedEmployee?.contact || '-'}
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        <strong>Member Since:</strong> {new Date(selectedEmployee?.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Grid>
                            </Grid>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSelectedEmployee(null)}>Close</Button>
                    </DialogActions>
                </Dialog>
            </Box>
            <Snackbar
                open={snackbarState.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarState.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbarState.message}
                </Alert>
            </Snackbar>
        </ManagerLayout>
    );
};

export default ManagerProfilePage;