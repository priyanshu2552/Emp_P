import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    TextField,
    Typography,
    Autocomplete,
    CircularProgress,
} from '@mui/material';

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
        profileImage: '',
        manager: null, // this will store manager object { _id, name }
    });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Axios instance with auth token
    const axiosInstance = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });

    // Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoadingProfile(true);
                const { data } = await axiosInstance.get('/employees/profile'); // Adjust URL as needed
                if (data.success) {
                    setProfile(data.profile);
                    setForm({
                        name: data.profile.name || '',
                        email: data.profile.email || '',
                        contact: data.profile.contact || '',
                        profileImage: data.profile.profileImage || '',
                        manager: data.profile.manager || null,
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

    // Search managers when manager field is focused or changed
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

    // Handle input change
    const handleChange = (field) => (event, value) => {
        // Special handling for Autocomplete (manager) - value is an object
        if (field === 'manager') {
            setForm((prev) => ({ ...prev, manager: value }));
        } else {
            setForm((prev) => ({ ...prev, [field]: event.target.value }));
        }
    };

    // Submit update profile
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        try {
            const updateData = {
                name: form.name,
                contact: form.contact,
                profileImage: form.profileImage,
                manager: form.manager?._id || null,
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

    if (loadingProfile) return <CircularProgress />;

    return (
        <Box maxWidth={600} mx="auto" mt={4} p={3} boxShadow={3} borderRadius={2}>
            <Typography variant="h4" mb={3}>
                Employee Profile
            </Typography>

            {error && (
                <Typography color="error" mb={2}>
                    {error}
                </Typography>
            )}
            {successMsg && (
                <Typography color="primary" mb={2}>
                    {successMsg}
                </Typography>
            )}

            {!editMode ? (
                <>
                    <Typography><b>Name:</b> {profile.name}</Typography>
                    <Typography><b>Email:</b> {profile.email}</Typography>
                    <Typography><b>Contact:</b> {profile.contact || 'N/A'}</Typography>
                    <Typography><b>Manager:</b> {profile.manager?.name || 'None'}</Typography>
                    {profile.profileImage && (
                        <Box mt={2}>
                            <img
                                src={profile.profileImage}
                                alt="Profile"
                                style={{ width: '150px', borderRadius: '8px' }}
                            />
                        </Box>
                    )}
                    <Button variant="contained" sx={{ mt: 3 }} onClick={() => setEditMode(true)}>
                        Edit Profile
                    </Button>
                </>
            ) : (
                <form onSubmit={handleSubmit} noValidate>
                    <TextField
                        label="Name"
                        value={form.name}
                        onChange={handleChange('name')}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Email"
                        value={form.email}
                        disabled
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Contact"
                        value={form.contact}
                        onChange={handleChange('contact')}
                        fullWidth
                        margin="normal"
                    />

                    {/* Manager Autocomplete */}
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
                                margin="normal"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingManagers ? <CircularProgress color="inherit" size={20} /> : null}
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
                        margin="normal"
                    />

                    <Box mt={2} display="flex" gap={2}>
                        <Button variant="contained" type="submit" color="primary">
                            Save
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                                setEditMode(false);
                                setForm({
                                    name: profile.name || '',
                                    email: profile.email || '',
                                    contact: profile.contact || '',
                                    profileImage: profile.profileImage || '',
                                    manager: profile.manager || null,
                                });
                                setError('');
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </form>
            )}
        </Box>
    );
};

export default EmployeeProfile;
