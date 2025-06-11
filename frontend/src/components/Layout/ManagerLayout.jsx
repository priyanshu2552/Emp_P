import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Drawer,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    CssBaseline,
    useTheme,
    useMediaQuery,
    styled,
    Paper,
    Typography,
    IconButton,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Person as ProfileIcon,
    Description as PolicyIcon,
    Receipt as ExpenseIcon,
    CalendarToday as LeaveIcon,
    Assessment as AppraisalIcon,
    RateReview as ReviewIcon,
    Group as TeamIcon,
    ExitToApp as LogoutIcon,
    Menu as MenuIcon,
} from '@mui/icons-material';
import { NavLink, useNavigate } from 'react-router-dom';

const drawerWidth = 260;

const SidebarPaper = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(195deg, rgb(25, 83, 141), rgb(23, 90, 146))',
    borderRadius: 0,
    height: '100%',
    boxShadow: theme.shadows[4],
    '&::-webkit-scrollbar': { display: 'none' },
    '-ms-overflow-style': 'none',
    scrollbarWidth: 'none',
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
    transition: 'all 0.3s ease',
    '&:hover': { boxShadow: theme.shadows[8] },
}));

const ManagerLayout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));
    const name = user?.name || 'Manager';

    //image handling 
    const [imageLoading, setImageLoading] = useState(true);
    const [userImage, setUserImage] = useState(user?.profileImage || '/default-avatar.png');

    const axiosInstance = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });
    useEffect(() => {
        // Set the initial image when component mounts
        if (user?._id) {
            const imageUrl = `http://localhost:5000/api/manager/${user._id}/profile-image?${Date.now()}`;
            setUserImage(imageUrl);
        }
    }, [user?._id]);

    useEffect(() => {
        const handleStorageChange = () => {
            const updatedUser = JSON.parse(localStorage.getItem('user'));
            if (updatedUser?._id) {
                const newImageUrl = `http://localhost:5000/api/manager/${updatedUser._id}/profile-image?${Date.now()}`;
                setUserImage(newImageUrl);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const managerOptions = [
        { label: 'Dashboard', to: '/manager/dashboard', icon: <DashboardIcon /> },
        { label: 'My Profile', to: '/manager/profile', icon: <ProfileIcon /> },
        { label: 'Company Policy', to: '/manager/policy', icon: <PolicyIcon /> },
        { label: 'Expense Approvals', to: '/manager/expense', icon: <ExpenseIcon /> },
        { label: 'Leave Approvals', to: '/manager/leave', icon: <LeaveIcon /> },
        { label: 'Appraisal Reviews', to: '/manager/appraisal', icon: <AppraisalIcon /> },
        { label: 'Weekly Reviews', to: '/manager/review', icon: <ReviewIcon /> },

    ];

    const StyledNavLink = styled(NavLink)(({ theme }) => ({
        textDecoration: 'none',
        color: 'white',
        '&.active': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderLeft: `4px solid white`,
            '& .MuiListItemIcon-root': { color: 'white' },
            '& .MuiListItemText-primary': { fontWeight: '600' }
        },
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }
    }));

    const drawer = (
        <SidebarPaper>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: 'white',
                            mb: 2,
                            fontSize: '1.5rem',
                            letterSpacing: '0.5px'
                        }}
                    >
                        Manager Portal
                    </Typography>
                    <Avatar
                        src={userImage}
                        sx={{
                            width: 80,
                            height: 80,
                            mb: 2,
                            mx: 'auto',
                            border: '3px solid rgba(255, 255, 255, 0.3)',
                        }}
                        imgProps={{
                            onError: (e) => {
                                e.target.src = '/default-avatar.png';
                            },
                            onLoad: () => setImageLoading(false),
                        }}
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: 'white',
                            fontSize: '1.2rem',
                            mb: 0.5
                        }}
                    >
                        {name}
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            letterSpacing: '0.3px'
                        }}
                    >
                        Manager
                    </Typography>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', my: 1 }} />

                <List
                    sx={{
                        flexGrow: 1,
                        overflow: 'auto',
                        p: 1,
                        '&::-webkit-scrollbar': { display: 'none' },
                        '-ms-overflow-style': 'none',
                        scrollbarWidth: 'none',
                    }}
                >

                    {managerOptions.map(({ label, to, icon }) => (
                        <StyledNavLink to={to} key={label}>
                            <ListItem button>
                                <ListItemIcon sx={{ minWidth: 40, color: 'white' }}>{icon}</ListItemIcon>
                                <ListItemText
                                    primary={label}
                                    primaryTypographyProps={{
                                        fontSize: '0.95rem',
                                        fontWeight: 500
                                    }}
                                />
                            </ListItem>
                        </StyledNavLink>
                    ))}
                </List>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', mx: 2 }} />

                <ListItem
                    button
                    onClick={handleLogout}
                    sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: 'rgba(255, 255, 255, 0.8)' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Logout"
                        primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }}
                    />
                </ListItem>
            </Box>
        </SidebarPaper>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
            <CssBaseline />

            {isMobile && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: theme.zIndex.drawer + 1,
                        background: 'linear-gradient(195deg, rgb(25, 83, 141), rgb(23, 90, 146))',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px',
                        height: '56px',
                        boxShadow: theme.shadows[4],
                    }}
                >
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        Manager Dashboard
                    </Typography>
                </Box>
            )}

            <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
                <Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            borderRight: 'none',
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                            overflowX: 'hidden',
                            '&::-webkit-scrollbar': { display: 'none' },
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 3 },
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    marginTop: { xs: '56px', md: 0 },
                    transition: theme.transitions.create('margin', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    ...(mobileOpen && {
                        [theme.breakpoints.down('md')]: {
                            marginLeft: `${drawerWidth}px`,
                            transition: theme.transitions.create('margin', {
                                easing: theme.transitions.easing.easeOut,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        },
                    }),
                }}
            >
                <GlassPaper sx={{ p: { xs: 2, md: 3 }, minHeight: 'calc(100vh - 40px)' }}>
                    {children}
                </GlassPaper>
            </Box>
        </Box>
    );
};

export default ManagerLayout;