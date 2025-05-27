import React from 'react';
import EventIcon from '@mui/icons-material/Event';
import MonetizationOn from '@mui/icons-material/MonetizationOn';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  Group as TeamIcon,
  Assignment as TaskIcon,
  CheckCircle as ApprovalIcon,
  TrendingUp as PerformanceIcon
} from '@mui/icons-material';

const ManagerDashboard = () => {
  const teamMembers = [
    { id: 1, name: 'John Doe', role: 'Senior Developer', tasks: 5, avatar: 'JD' },
    { id: 2, name: 'Jane Smith', role: 'UX Designer', tasks: 3, avatar: 'JS' },
    { id: 3, name: 'Mike Johnson', role: 'Junior Developer', tasks: 7, avatar: 'MJ' },
  ];

  const pendingApprovals = [
    { id: 1, type: 'Leave Request', name: 'Sarah Williams', days: 3 },
    { id: 2, type: 'Expense Claim', name: 'David Brown', amount: '$245' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Manager Dashboard
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TeamIcon sx={{ mr: 1 }} /> My Team
            </Typography>
            <List>
              {teamMembers.map((member) => (
                <ListItem key={member.id} secondaryAction={
                  <Chip label={`${member.tasks} tasks`} size="small" />
                }>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#1976d2' }}>
                      {member.avatar}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={member.role}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ApprovalIcon sx={{ mr: 1 }} /> Pending Approvals
            </Typography>
            <List>
              {pendingApprovals.map((approval) => (
                <ListItem key={approval.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: approval.type === 'Leave Request' ? '#ff9800' : '#4caf50',
                      width: 32, 
                      height: 32 
                    }}>
                      {approval.type === 'Leave Request' ? 
                        <EventIcon fontSize="small" /> : 
                        <MonetizationOn fontSize="small" />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={approval.name}
                    secondary={
                      approval.type === 'Leave Request' ? 
                      `${approval.type} (${approval.days} days)` : 
                      `${approval.type} (${approval.amount})`
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card sx={{ p: 2, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PerformanceIcon sx={{ mr: 1 }} /> Team Performance
            </Typography>
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Quarterly Goals Completion
              </Typography>
              <LinearProgress variant="determinate" value={65} sx={{ height: 10, borderRadius: 5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption">65% completed</Typography>
                <Typography variant="caption">Target: 80%</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;