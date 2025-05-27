import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Toolbar,
  Box
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Receipt as ExpenseIcon,
  CalendarToday as LeaveIcon,
  Assessment as AppraisalIcon,
  Settings as SettingsIcon,
  GroupWork as TeamIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user } = useAuth();

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItem 
          button 
          component={NavLink} 
          to={`/${user?.role}/dashboard`}
          sx={{
            '&.active': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              '& .MuiListItemIcon-root': {
                color: '#1976d2'
              },
              '& .MuiListItemText-primary': {
                fontWeight: '500',
                color: '#1976d2'
              }
            }
          }}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        {user?.role === 'employee' && (
          <>
            <ListItem 
              button 
              component={NavLink} 
              to="/employee/expenses"
              sx={{
                '&.active': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  '& .MuiListItemIcon-root': {
                    color: '#1976d2'
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: '500',
                    color: '#1976d2'
                  }
                }
              }}
            >
              <ListItemIcon>
                <ExpenseIcon />
              </ListItemIcon>
              <ListItemText primary="My Expenses" />
            </ListItem>
            
            <ListItem 
              button 
              component={NavLink} 
              to="/employee/leaves"
              sx={{
                '&.active': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  '& .MuiListItemIcon-root': {
                    color: '#1976d2'
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: '500',
                    color: '#1976d2'
                  }
                }
              }}
            >
              <ListItemIcon>
                <LeaveIcon />
              </ListItemIcon>
              <ListItemText primary="My Leaves" />
            </ListItem>
          </>
        )}
        
        {(user?.role === 'manager' || user?.role === 'admin') && (
          <ListItem 
            button 
            component={NavLink} 
            to={`/${user?.role}/team`}
            sx={{
              '&.active': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                '& .MuiListItemIcon-root': {
                  color: '#1976d2'
                },
                '& .MuiListItemText-primary': {
                  fontWeight: '500',
                  color: '#1976d2'
                }
              }
            }}
          >
            <ListItemIcon>
              <TeamIcon />
            </ListItemIcon>
            <ListItemText primary="Team" />
          </ListItem>
        )}
        
        {user?.role === 'admin' && (
          <ListItem 
            button 
            component={NavLink} 
            to="/admin/settings"
            sx={{
              '&.active': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                '& .MuiListItemIcon-root': {
                  color: '#1976d2'
                },
                '& .MuiListItemText-primary': {
                  fontWeight: '500',
                  color: '#1976d2'
                }
              }
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        )}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: 'none',
            boxShadow: '1px 0px 4px rgba(0, 0, 0, 0.1)'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;