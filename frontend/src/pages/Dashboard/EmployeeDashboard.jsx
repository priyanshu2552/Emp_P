import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Event as EventIcon,
  Receipt as ExpenseIcon,
  Notifications as AnnouncementIcon
} from '@mui/icons-material';

const EmployeeDashboard = () => {
  const tasks = [
    { id: 1, title: 'Complete quarterly report', due: 'Tomorrow' },
    { id: 2, title: 'Submit expense claims', due: 'In 3 days' },
    { id: 3, title: 'Attend team meeting', due: 'Today 2:00 PM' },
  ];

  const announcements = [
    { id: 1, title: 'New company policy update', date: '2 hours ago' },
    { id: 2, title: 'Office closed on Friday', date: '1 day ago' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        My Dashboard
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TaskIcon sx={{ mr: 1 }} /> My Tasks
              </Typography>
              <List>
                {tasks.map((task) => (
                  <ListItem key={task.id} secondaryAction={
                    <Button size="small" variant="outlined">View</Button>
                  }>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>
                        <TaskIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={task.title}
                      secondary={`Due: ${task.due}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AnnouncementIcon sx={{ mr: 1 }} /> Announcements
              </Typography>
              <List>
                {announcements.map((announcement) => (
                  <ListItem key={announcement.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#ff9800', width: 32, height: 32 }}>
                        <AnnouncementIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={announcement.title}
                      secondary={announcement.date}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ mr: 1 }} /> Quick Actions
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<ExpenseIcon />}
                    sx={{ py: 2 }}
                  >
                    Submit Expense
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<EventIcon />}
                    sx={{ py: 2 }}
                  >
                    Request Leave
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;