import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api/employees';

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    reason: ''
  });

  const token = localStorage.getItem('token');

  const fetchLeaves = async () => {
    try {
      const res = await fetch(`${API_BASE}/leaves`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setLeaves(data.leaves);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/leaves`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (data.success) {
      alert('Leave submitted!');
      setForm({ startDate: '', endDate: '', leaveType: '', reason: '' });
      fetchLeaves();
    } else {
      alert(data.message);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>Submit Leave Request</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          required
        /><br />
        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          required
        /><br />
        <input
          type="text"
          name="leaveType"
          placeholder="Leave Type (e.g. Sick, Casual)"
          value={form.leaveType}
          onChange={handleChange}
        /><br />
        <textarea
          name="reason"
          placeholder="Reason for leave"
          value={form.reason}
          onChange={handleChange}
          required
        /><br />
        <button type="submit">Submit</button>
      </form>

      <h2>Your Leave Requests</h2>
      <button onClick={fetchLeaves}>Refresh</button>
      <table border="1" cellPadding="8" style={{ marginTop: '1rem', width: '100%', maxWidth: '800px' }}>
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Type</th>
            <th>Reason</th>
            <th>Status</th>
            <th>SuperVisor Comment</th>
          </tr>
        </thead>
        <tbody>
          {leaves.length > 0 ? (
            leaves.map((leave) => (
              <tr key={leave._id}>
                <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                <td>{leave.leaveType}</td>
                <td>{leave.reason}</td>
                <td>{leave.status}</td>
                <td>{leave.SupervisorComment || '-'}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6">No leave records found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Leave;
