import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000/api/admin';

const AdminLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [updateForm, setUpdateForm] = useState({ status: '', SupervisorComment: '' });
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const token = localStorage.getItem('token');

  const fetchLeaves = async () => {
    try {
      const res = await fetch(`${API_BASE}/leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setLeaves(data.leaves);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  const handleChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/leaves/${selectedLeaveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('Leave updated successfully');
        setSelectedLeaveId(null);
        setUpdateForm({ status: '', SupervisorComment: '' });
        fetchLeaves();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error updating leave:', err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>All Leave Requests</h2>
      <table border="1" cellPadding="8" style={{ marginTop: '1rem', width: '100%', maxWidth: '1000px' }}>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Start</th>
            <th>End</th>
            <th>Type</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Supervisor Comment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr key={leave._id}>
              <td>{leave.userId?.name}</td>
              <td>{leave.userId?.email}</td>
              <td>{new Date(leave.startDate).toLocaleDateString()}</td>
              <td>{new Date(leave.endDate).toLocaleDateString()}</td>
              <td>{leave.leaveType}</td>
              <td>{leave.reason}</td>
              <td>{leave.status}</td>
              <td>{leave.SupervisorComment}</td>
              <td>
                <button onClick={() => setSelectedLeaveId(leave._id)}>Update</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedLeaveId && (
        <form onSubmit={handleUpdate} style={{ marginTop: '2rem' }}>
          <h3>Update Leave Status</h3>
          <select name="status" value={updateForm.status} onChange={handleChange} required>
            <option value="">Select Status</option>
            <option value="approved">Approve</option>
            <option value="rejected">Reject</option>
          </select><br />
          <textarea
            name="SupervisorComment"
            placeholder="SuperVisor comment"
            value={updateForm.SupervisorComment}
            onChange={handleChange}
          /><br />
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default AdminLeave;
