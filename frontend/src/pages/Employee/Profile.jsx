import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    TextField,
    Typography,
    Autocomplete,
    CircularProgress,
    Avatar,
    Paper,
    Snackbar,
    Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardLayout from '../../components/Layout/EmployeeLayout';

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

const EmployeeProfile = () => {
    const [profile, setProfile] = useState(null);
    const [managers, setManagers] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingManagers, setLoadingManagers] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        contact: '',
        address: '',
        manager: null,
        Department: '',
        EmployeeId: '',
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [imagePreview, setImagePreview] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const axiosInstance = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoadingProfile(true);
                const { data } = await axiosInstance.get('/employees/profile');
                if (data.success) {
                    setProfile(data.profile);
                    setForm({
                        name: data.profile.name || '',
                        email: data.profile.email || '',
                        contact: data.profile.contact || '',
                        address: data.profile.address || '',
                        manager: data.profile.manager || null,
                        Department: data.profile.Department || '',
                        EmployeeId: data.profile.EmployeeId || '',
                    });
                    if (data.profile._id) {
                       setImagePreview(`http://localhost:5000/api/employees/${data.profile._id}/profile-image?${Date.now()}`);
                       console.log(imagePreview);
                    }
                }
            } catch (err) {
                showSnackbar('Failed to load profile.', 'error');
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    const fetchManagers = async (search = '') => {
        try {
            setLoadingManagers(true);
            const { data } = await axiosInstance.get('/employees/managers', {
                params: { search },
            });
            if (data.success) {
                setManagers(data.managers);
            }
        } catch {
            // ignore errors here
        } finally {
            setLoadingManagers(false);
        }
    };

    const handleChange = (field) => (event, value) => {
        if (field === 'manager') {
            setForm((prev) => ({ ...prev, manager: value }));
        } else {
            setForm((prev) => ({ ...prev, [field]: event.target.value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const updateData = {
                name: form.name,
                contact: form.contact,
                address: form.address,
                manager: form.manager?._id || null,
                Department: form.Department,
                EmployeeId: form.EmployeeId,
            };

            const { data } = await axiosInstance.put('/employees/profile', updateData);
            if (data.success) {
                setProfile(data.profile);
                showSnackbar('Profile updated successfully!', 'success');
                setEditMode(false);
            }
        } catch (err) {
            showSnackbar(err.response?.data?.message || 'Update failed', 'error');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const formData = new FormData();
            formData.append('profileImage', file);
            
            const { data } = await axiosInstance.put(
                '/employees/profile/image',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            if (data.success) {
                // Force refresh the image by adding timestamp
                setImagePreview(`http://localhost:5000/api/employees/${profile._id}/profile-image?${Date.now()}`);
                
                showSnackbar('Profile image updated successfully!', 'success');
                
                // Update the profile data in state if needed
                if (data.profile) {
                    setProfile(data.profile);
                }
            }
        } catch (err) {
            console.error('Upload error:', err);
            showSnackbar(err.response?.data?.message || 'Image upload failed', 'error');
        } finally {
            setUploadingImage(false);
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    if (loadingProfile) {
        return (
            <DashboardLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress size={60} />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2,
                minHeight: 'calc(100vh - 64px)',
                overflow: 'hidden'
            }}>
                <Box sx={{ 
                    width: '100%',
                    maxWidth: '800px'
                }}>
                    <Typography variant="h6" sx={{ 
                        fontWeight: 600,
                        mb: 2,
                        fontSize: '1.1rem',
                        textAlign: 'center'
                    }}>
                        My Profile
                    </Typography>

                    {!editMode ? (
                        <Paper elevation={0} sx={{ 
                            p: 2,
                            mb: 2,
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px'
                        }}>
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ 
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    pb: 1,
                                    borderBottom: '2px solid #4f8bff'
                                }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                        Personal Information
                                    </Typography>
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                        onClick={() => setEditMode(true)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Edit
                                    </Button>
                                </Box>
                            </Box>

                            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                                <Box display="flex" flexDirection="column" alignItems="center" flexShrink={0}>
                                    <Avatar
                                        src={imagePreview}
                                        alt="Profile"
                                        sx={{ 
                                            width: 80, 
                                            height: 80,
                                            mb: 1
                                        }}
                                    />
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        size="small"
                                        disabled={uploadingImage}
                                    >
                                        {uploadingImage ? 'Uploading...' : 'Change Image'}
                                        <VisuallyHiddenInput 
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </Button>
                                </Box>
                                <Box flex={1}>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="body2" sx={{ width: 120, color: 'text.secondary' }}>Name:</Typography>
                                        <Typography variant="body2">{profile.name}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="body2" sx={{ width: 120, color: 'text.secondary' }}>Email:</Typography>
                                        <Typography variant="body2">{profile.email}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="body2" sx={{ width: 120, color: 'text.secondary' }}>Employee ID:</Typography>
                                        <Typography variant="body2">{profile.EmployeeId || '-'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="body2" sx={{ width: 120, color: 'text.secondary' }}>Department:</Typography>
                                        <Typography variant="body2">{profile.Department || '-'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="body2" sx={{ width: 120, color: 'text.secondary' }}>Contact:</Typography>
                                        <Typography variant="body2">{profile.contact || '-'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="body2" sx={{ width: 120, color: 'text.secondary' }}>Address:</Typography>
                                        <Typography variant="body2">{profile.address || '-'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="body2" sx={{ width: 120, color: 'text.secondary' }}>Manager:</Typography>
                                        <Typography variant="body2">{profile.manager?.name || '-'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="body2" sx={{ width: 120, color: 'text.secondary' }}>Role:</Typography>
                                        <Typography variant="body2" textTransform="capitalize">{profile.role}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    ) : (
                        <Box component="form" onSubmit={handleSubmit}>
                            <Paper elevation={0} sx={{ 
                                p: 2,
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px'
                            }}>
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ 
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        pb: 1,
                                        borderBottom: '2px solid #4f8bff'
                                    }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                            Edit Profile
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                                    <Box display="flex" flexDirection="column" alignItems="center" flexShrink={0}>
                                        <Avatar
                                            src={imagePreview}
                                            alt="Profile Preview"
                                            sx={{ 
                                                width: 80, 
                                                height: 80,
                                                mb: 1
                                            }}
                                        />
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            size="small"
                                            disabled={uploadingImage}
                                        >
                                            {uploadingImage ? (
                                                <>
                                                    <CircularProgress size={16} sx={{ mr: 1 }} />
                                                    Uploading...
                                                </>
                                            ) : (
                                                'Upload New Image'
                                            )}
                                            <VisuallyHiddenInput 
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </Button>
                                    </Box>
                                    <Box flex={1}>
                                        <TextField
                                            label="Name"
                                            value={form.name}
                                            onChange={handleChange('name')}
                                            fullWidth
                                            margin="dense"
                                            size="small"
                                            required
                                        />
                                        <TextField
                                            label="Email"
                                            value={form.email}
                                            disabled
                                            fullWidth
                                            margin="dense"
                                            size="small"
                                        />
                                      
                                        <TextField
                                            label="Department"
                                            value={form.Department}
                                            onChange={handleChange('Department')}
                                            fullWidth
                                            margin="dense"
                                            size="small"
                                        />
                                        <TextField
                                            label="Contact"
                                            value={form.contact}
                                            onChange={handleChange('contact')}
                                            fullWidth
                                            margin="dense"
                                            size="small"
                                        />
                                        <TextField
                                            label="Address"
                                            value={form.address}
                                            onChange={handleChange('address')}
                                            fullWidth
                                            margin="dense"
                                            size="small"
                                            multiline
                                            rows={2}
                                        />
                                        <Autocomplete
                                            options={managers}
                                            getOptionLabel={(option) => option.name || ''}
                                            value={form.manager}
                                            onChange={handleChange('manager')}
                                            onInputChange={(e, value, reason) => {
                                                if (reason === 'input' || reason === 'clear') fetchManagers(value);
                                            }}
                                            onFocus={() => {
                                                if (managers.length === 0) fetchManagers('');
                                            }}
                                            loading={loadingManagers}
                                            isOptionEqualToValue={(option, value) => option._id === value._id}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Manager"
                                                    margin="dense"
                                                    size="small"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {loadingManagers ? <CircularProgress color="inherit" size={16} /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            )}
                                            clearOnEscape
                                        />
                                    </Box>
                                </Box>

                                <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => setEditMode(false)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        type="submit"
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Save
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>
                    )}
                </Box>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DashboardLayout>
    );
};

export default EmployeeProfile;