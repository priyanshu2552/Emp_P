import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Divider,
    Paper,
    CircularProgress,
    styled
} from '@mui/material';
import EmployeeLayout from '../../components/Layout/EmployeeLayout';

const API_BASE = 'http://localhost:5000/api/employees';

const PolicyCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
    border: '1px solid rgba(0,0,0,0.05)',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        background: 'linear-gradient(135deg, #f1f3f5 0%, #ffffff 100%)',
    },
}));

const DownloadLink = styled('a')(({ theme }) => ({
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    '&:hover': {
        textDecoration: 'underline',
        color: theme.palette.primary.dark,
    },
}));

const StatusBadge = styled(Box)(({ theme, read }) => ({
    display: 'inline-block',
    padding: theme.spacing(0.5, 1.5),
    borderRadius: '20px',
    background: read 
        ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)' 
        : 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
    color: read ? theme.palette.success.dark : theme.palette.error.dark,
    fontWeight: 500,
    fontSize: '0.75rem',
    margin: theme.spacing(1, 0),
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
}));

const EmployeePolicyPage = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/policies`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setPolicies(data.policies);
            }
        } catch (error) {
            console.error('Error fetching policies:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (policyId) => {
        try {
            const res = await fetch(`${API_BASE}/policies/ack`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ policyId }),
            });
            const data = await res.json();
            if (data.success) fetchPolicies();
        } catch (err) {
            console.error('Failed to mark policy as read:', err);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    return (
        <EmployeeLayout>
            <Box sx={{ 
                p: { xs: 2, md: 3 },
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    mb: 3,
                    color: 'text.primary',
                    position: 'relative',
                    fontSize: '1.25rem',
                    '&:after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: 0,
                        width: '50px',
                        height: '3px',
                        background: 'linear-gradient(90deg, #1976d2 0%, #4dabf5 100%)',
                        borderRadius: '3px',
                    }
                }}>
                    Company Policies
                </Typography>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress size={24} />
                    </Box>
                ) : policies.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No policies available at this time.
                    </Typography>
                ) : (
                    <Box>
                        {policies.map((policy) => (
                            <React.Fragment key={policy._id}>
                                <PolicyCard>
                                    <Typography variant="subtitle1" sx={{ 
                                        fontWeight: 600,
                                        mb: 1,
                                        color: 'primary.main',
                                        fontSize: '1rem'
                                    }}>
                                        {policy.title} <Typography component="span" variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>(v{policy.version})</Typography>
                                    </Typography>
                                    <Typography variant="body2" paragraph sx={{ 
                                        color: 'text.secondary',
                                        fontSize: '0.875rem',
                                        lineHeight: 1.5
                                    }}>
                                        {policy.description}
                                    </Typography>
                                    
                                    <DownloadLink
                                        href={policy.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        download
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 16L7 11L8.41 9.59L11 12.17V4H13V12.17L15.59 9.58L17 11L12 16Z" fill="currentColor"/>
                                            <path d="M19 19H5V15H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V15H19V19Z" fill="currentColor"/>
                                        </svg>
                                        Download Policy Document
                                    </DownloadLink>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                        <StatusBadge read={policy.isRead}>
                                            {policy.isRead ? '✓ Acknowledged' : '✗ Pending Acknowledgement'}
                                        </StatusBadge>
                                        {!policy.isRead && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => markAsRead(policy._id)}
                                                sx={{ 
                                                    ml: 2,
                                                    textTransform: 'none',
                                                    borderRadius: '20px',
                                                    px: 2,
                                                    py: 0.5,
                                                    fontSize: '0.75rem',
                                                    background: 'linear-gradient(135deg, #1976d2 0%, #4dabf5 100%)',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
                                                    }
                                                }}
                                            >
                                                Acknowledge Policy
                                            </Button>
                                        )}
                                    </Box>
                                </PolicyCard>
                                <Divider sx={{ my: 1, borderColor: 'divider', opacity: 0.5 }} />
                            </React.Fragment>
                        ))}
                    </Box>
                )}
            </Box>
        </EmployeeLayout>
    );
};

export default EmployeePolicyPage;