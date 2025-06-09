import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Divider,
    Paper,
    CircularProgress,
    styled,
    Snackbar,
    Alert,
    Modal,
    Backdrop,
    Fade
} from '@mui/material';
import ManagerLayout from '../../components/Layout/ManagerLayout';

const API_BASE = 'http://localhost:5000/api/manager';

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

const ContentBox = styled(Box)(({ theme }) => ({
    maxHeight: '60vh',
    overflowY: 'auto',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
}));

const ModalBox = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '800px',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[24],
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    outline: 'none',
}));

const ManagerPolicyPage = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [currentPolicy, setCurrentPolicy] = useState(null);
    const [policyText, setPolicyText] = useState('');
    const [scrolledEnough, setScrolledEnough] = useState(false);
    const [textLoading, setTextLoading] = useState(false);
    const contentRef = useRef(null);
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
            setError('Failed to fetch policies');
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
            setError('Failed to acknowledge policy');
        }
    };

    const handleDownload = async (policyId, policyTitle) => {
        try {
            setDownloading(true);
            setError(null);

            const response = await fetch(
                `${API_BASE}/policies/${policyId}/download`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${policyTitle}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Download error:', error);
            setError(error.message || 'Failed to download file');
        } finally {
            setDownloading(false);
        }
    };

    const handleOpenModal = async (policy) => {
        setCurrentPolicy(policy);
        setTextLoading(true);
        try {
            const res = await fetch(`${API_BASE}/policies/${policy._id}/text`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setPolicyText(data.text || 'No text content available for this policy.');
            } else {
                setPolicyText('No text content available for this policy.');
            }
        } catch (error) {
            console.error('Error fetching policy text:', error);
            setPolicyText('Failed to load policy content.');
        } finally {
            setTextLoading(false);
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setScrolledEnough(false);
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
        setScrolledEnough(scrollPercentage > 0.75);
    };

    const handleCloseError = () => {
        setError(null);
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    return (
        <ManagerLayout>
            <Box sx={{
                p: { xs: 2, md: 3 },
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                {/* Error Snackbar */}
                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={handleCloseError}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                </Snackbar>

                {/* Downloading Snackbar */}
                <Snackbar
                    open={downloading}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert severity="info" sx={{ width: '100%' }}>
                        Preparing download...
                    </Alert>
                </Snackbar>

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
                    Manager Policies
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
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDownload(policy._id, policy.title);
                                        }}
                                        download
                                    >
                                        {downloading ? (
                                            <CircularProgress size={14} color="inherit" />
                                        ) : (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 16L7 11L8.41 9.59L11 12.17V4H13V12.17L15.59 9.58L17 11L12 16Z" fill="currentColor" />
                                                <path d="M19 19H5V15H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V15H19V19Z" fill="currentColor" />
                                            </svg>
                                        )}
                                        Download Policy Document
                                    </DownloadLink>

                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                        <StatusBadge read={policy.isRead}>
                                            {policy.isRead ? '✓ Acknowledged' : '✗ Pending Acknowledgement'}
                                        </StatusBadge>
                                    </Box>

                                    {!policy.isRead && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleOpenModal(policy)}
                                            sx={{
                                                mt: 2,
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
                                            Read and Acknowledge Policy
                                        </Button>
                                    )}
                                </PolicyCard>
                                <Divider sx={{ my: 1, borderColor: 'divider', opacity: 0.5 }} />
                            </React.Fragment>
                        ))}
                    </Box>
                )}

                {/* Policy Content Modal */}
                <Modal
                    open={openModal}
                    onClose={handleCloseModal}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                        timeout: 500,
                    }}
                >
                    <Fade in={openModal}>
                        <ModalBox>
                            <Typography variant="h6" gutterBottom>
                                {currentPolicy?.title}
                            </Typography>
                            <ContentBox 
                                ref={contentRef}
                                onScroll={handleScroll}
                            >
                                {textLoading ? (
                                    <Box display="flex" justifyContent="center" py={4}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : (
                                    <Typography variant="body2" whiteSpace="pre-wrap">
                                        {policyText}
                                    </Typography>
                                )}
                            </ContentBox>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleCloseModal}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        markAsRead(currentPolicy._id);
                                        handleCloseModal();
                                    }}
                                    disabled={!scrolledEnough || textLoading}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Acknowledge Policy
                                </Button>
                            </Box>
                            {!scrolledEnough && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Please scroll through at least 75% of the content to acknowledge.
                                </Typography>
                            )}
                        </ModalBox>
                    </Fade>
                </Modal>
            </Box>
        </ManagerLayout>
    );
};

export default ManagerPolicyPage;