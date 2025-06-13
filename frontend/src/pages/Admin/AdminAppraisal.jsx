import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, Paper, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Alert, CircularProgress,
  TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl,Rating,
  InputLabel, Select
} from '@mui/material';
import axios from 'axios';

const AdminDashboard = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [filter, setFilter] = useState({
    status: '',
    period: '',
    year: ''
  });
  const [templateData, setTemplateData] = useState({
    period: 'Q1',
    year: new Date().getFullYear(),
    kras: [
      {
        name: 'Code Quality',
        kpis: [
          { name: 'Code review pass rate', target: '90%+' },
          { name: 'Defect leakage', target: '<5%' },
          { name: 'Coding standards', target: '100% adherence' }
        ]
      },
      {
        name: 'On-Time Delivery',
        kpis: [
          { name: 'Sprint completion', target: '95%' },
          { name: 'Scope creep', target: '<10%' }
        ]
      }
    ]
  });

  useEffect(() => {
    fetchAppraisals();
  }, [filter]);

  const fetchAppraisals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.period) params.period = filter.period;
      if (filter.year) params.year = filter.year;
      
      const { data } = await axios.get('http://localhost:5000/api/admin/appraisals', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppraisals(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appraisals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      await axios.post('http://localhost:5000/api/admin/appraisals', templateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Appraisal template created successfully');
      setOpenDialog(false);
      fetchAppraisals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create template');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Appraisal Management
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
              <MenuItem value="reviewed">Reviewed</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={filter.period}
              onChange={(e) => setFilter({ ...filter, period: e.target.value })}
              label="Period"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Q1">Q1</MenuItem>
              <MenuItem value="Q2">Q2</MenuItem>
              <MenuItem value="Q3">Q3</MenuItem>
              <MenuItem value="Q4">Q4</MenuItem>
              <MenuItem value="Annual">Annual</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Year"
            type="number"
            value={filter.year}
            onChange={(e) => setFilter({ ...filter, year: e.target.value })}
            sx={{ width: 120 }}
          />
        </Box>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          Create New Appraisal Cycle
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Overall Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appraisals.length > 0 ? (
              appraisals.map((appraisal) => (
                <TableRow key={appraisal._id}>
                  <TableCell>{appraisal.employee?.name || 'N/A'}</TableCell>
                  <TableCell>{appraisal.manager?.name || 'N/A'}</TableCell>
                  <TableCell>{appraisal.period} {appraisal.year}</TableCell>
                  <TableCell>{appraisal.status}</TableCell>
                  <TableCell>
                    {appraisal.overallRating ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={appraisal.overallRating} precision={0.5} readOnly />
                        <Typography sx={{ ml: 1 }}>{appraisal.overallRating}</Typography>
                      </Box>
                    ) : 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No appraisals found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Appraisal Cycle</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={templateData.period}
                onChange={(e) => setTemplateData({ ...templateData, period: e.target.value })}
                label="Period"
              >
                <MenuItem value="Q1">Q1</MenuItem>
                <MenuItem value="Q2">Q2</MenuItem>
                <MenuItem value="Q3">Q3</MenuItem>
                <MenuItem value="Q4">Q4</MenuItem>
                <MenuItem value="Annual">Annual</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Year"
              type="number"
              value={templateData.year}
              onChange={(e) => setTemplateData({ ...templateData, year: e.target.value })}
              fullWidth
              sx={{ mb: 3 }}
            />
            
            <Typography variant="h6" sx={{ mb: 2 }}>Key Result Areas</Typography>
            {templateData.kras.map((kra, kraIndex) => (
              <Paper key={kraIndex} sx={{ p: 2, mb: 2 }}>
                <TextField
                  label="KRA Name"
                  value={kra.name}
                  onChange={(e) => {
                    const newKras = [...templateData.kras];
                    newKras[kraIndex].name = e.target.value;
                    setTemplateData({ ...templateData, kras: newKras });
                  }}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="subtitle1">KPIs</Typography>
                {kra.kpis.map((kpi, kpiIndex) => (
                  <Box key={kpiIndex} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <TextField
                      label="KPI Name"
                      value={kpi.name}
                      onChange={(e) => {
                        const newKras = [...templateData.kras];
                        newKras[kraIndex].kpis[kpiIndex].name = e.target.value;
                        setTemplateData({ ...templateData, kras: newKras });
                      }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Target"
                      value={kpi.target}
                      onChange={(e) => {
                        const newKras = [...templateData.kras];
                        newKras[kraIndex].kpis[kpiIndex].target = e.target.value;
                        setTemplateData({ ...templateData, kras: newKras });
                      }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                ))}
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleCreateTemplate}
          >
            Create Appraisal Cycle
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;