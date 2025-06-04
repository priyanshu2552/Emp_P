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
    Paper
} from '@mui/material';
import DashboardLayout from '../../components/Layout/EmployeeLayout';

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
        profileImage: '',
        manager: null,
        Department: '',
        EmployeeId: '',
    });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

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
                        profileImage: data.profile.profileImage || '',
                        manager: data.profile.manager || null,
                        Department: data.profile.Department || '',
                        EmployeeId: data.profile.EmployeeId || '',
                    });
                }
            } catch (err) {
                setError('Failed to load profile.');
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
        setError('');
        setSuccessMsg('');

        try {
            const updateData = {
                name: form.name,
                contact: form.contact,
                address: form.address,
                profileImage: form.profileImage,
                manager: form.manager?._id || null,
                Department: form.Department,
                EmployeeId: form.EmployeeId,
            };

            const { data } = await axiosInstance.put('/employees/profile', updateData);
            if (data.success) {
                setProfile(data.profile);
                setSuccessMsg('Profile updated successfully!');
                setEditMode(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        }
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
                                <Box display="flex" justifyContent="center" flexShrink={0}>
                                    <Avatar
                                        src={profile.profileImage}
                                        alt="Profile"
                                        sx={{ 
                                            width: 80, 
                                            height: 80,
                                        }}
                                    />
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

                                {error && (
                                    <Typography color="error" variant="body2" mb={2}>
                                        {error}
                                    </Typography>
                                )}
                                {successMsg && (
                                    <Typography color="primary" variant="body2" mb={2}>
                                        {successMsg}
                                    </Typography>
                                )}

                                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                                    <Box display="flex" justifyContent="center" flexShrink={0}>
                                        <Avatar
                                            src={form.profileImage}
                                            alt="Profile"
                                            sx={{ 
                                                width: 80, 
                                                height: 80,
                                            }}
                                        />
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
                                        {/* <TextField
                                            label="Employee ID"
                                            value={form.EmployeeId}
                                            onChange={handleChange('EmployeeId')}
                                            fullWidth
                                            margin="dense"
                                            size="small"
                                        /> */}
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
                                        <TextField
                                            label="Profile Image URL"
                                            value={form.profileImage}
                                            onChange={handleChange('profileImage')}
                                            fullWidth
                                            margin="dense"
                                            size="small"
                                            sx={{ mt: 1 }}
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
        </DashboardLayout>
    );
};

export default EmployeeProfile;