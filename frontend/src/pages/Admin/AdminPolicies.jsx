import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Box,
  Snackbar,
  Alert,
  TablePagination
} from '@mui/material';
import { Add, Edit, Visibility, Delete } from '@mui/icons-material';

const AdminPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pdf, setPdf] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const token = localStorage.getItem('token');

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    },
  };

  const fetchPolicies = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/policies', axiosConfig);
      setPolicies(res.data.policies);
    } catch (err) {
      console.error('Error fetching policies:', err);
      showSnackbar('Failed to fetch policies.', 'error');
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || (!pdf && !selectedPolicy)) {
      showSnackbar('Title and PDF file are required.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (pdf) formData.append('pdf', pdf);

    try {
      if (selectedPolicy) {
        await axios.put(
          `http://localhost:5000/api/admin/policies/${selectedPolicy._id}`,
          formData,
          axiosConfig
        );
        showSnackbar('Policy updated successfully');
      } else {
        await axios.post(
          'http://localhost:5000/api/admin/policies',
          formData,
          axiosConfig
        );
        showSnackbar('Policy uploaded successfully');
      }

      resetForm();
      fetchPolicies();
    } catch (error) {
      console.error('Upload error:', error);
      showSnackbar('Operation failed', 'error');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPdf(null);
    setSelectedPolicy(null);
    setOpenModal(false);
  };

  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setTitle(policy.title);
    setDescription(policy.description || '');
    setOpenModal(true);
  };

  const handleDeleteClick = (policy) => {
    setPolicyToDelete(policy);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/policies/${policyToDelete._id}`,
        axiosConfig
      );
      showSnackbar('Policy deleted successfully');
      fetchPolicies();
    } catch (error) {
      console.error('Delete error:', error);
      showSnackbar('Failed to delete policy', 'error');
    }
    setOpenDeleteDialog(false);
    setPolicyToDelete(null);
  };

  const openNewPolicyModal = () => {
    resetForm();
    setOpenModal(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Policy Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={openNewPolicyModal}
          size="small"
        >
          Add New Policy
        </Button>
      </Box>

      {/* Policies Table */}
      <Paper sx={{ mb: 2 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5', height: '40px' }}>
                <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Version</TableCell>
                <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {policies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                    No policies found
                  </TableCell>
                </TableRow>
              ) : (
                policies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((policy) => (
                  <TableRow key={policy._id} hover sx={{ height: '48px' }}>
                    <TableCell sx={{ py: 0.5 }}>{policy.title}</TableCell>
                    <TableCell sx={{ 
                      maxWidth: 200, 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      py: 0.5
                    }}>
                      {policy.description}
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>v{policy.version}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <IconButton
                        color="primary"
                        size="small"
                        href={`http://localhost:5000${policy.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton 
                        color="secondary" 
                        size="small" 
                        onClick={() => handleEdit(policy)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleDeleteClick(policy)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={policies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Policy Modal */}
      <Dialog open={openModal} onClose={resetForm} maxWidth="md" fullWidth>
        <DialogTitle>{selectedPolicy ? 'Update Policy' : 'Add New Policy'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              label="Title *"
              fullWidth
              margin="dense"
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextField
              label="Description"
              fullWidth
              margin="dense"
              size="small"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {selectedPolicy ? 'Upload New PDF (optional)' : 'Upload PDF *'}
              </Typography>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdf(e.target.files[0])}
                required={!selectedPolicy}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm} size="small">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            size="small"
          >
            {selectedPolicy ? 'Update Policy' : 'Upload Policy'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the policy "{policyToDelete?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} size="small">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" size="small">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPolicies;