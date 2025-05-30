import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminAppraisalPage = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [managerFilter, setManagerFilter] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const token = localStorage.getItem('token');

  const fetchAppraisals = async () => {
    try {
      const url = managerFilter
        ? `http://localhost:5000/api/admin/appraisals?managerId=${managerFilter}`
        : 'http://localhost:5000/api/admin/appraisals';

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setAppraisals(res.data.appraisals);
    } catch (err) {
      console.error('Error fetching appraisals:', err);
      alert('Failed to load appraisals');
    }
  };

  const fetchUserDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUserDetails(res.data.user);
    } catch (err) {
      console.error('Error fetching user:', err);
      alert('Could not fetch user details');
    }
  };

  useEffect(() => {
    fetchAppraisals();
  }, [managerFilter]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Appraisals Overview</h2>
      <div>
        <label>Filter by Manager ID: </label>
        <input
          type="text"
          value={managerFilter}
          onChange={(e) => setManagerFilter(e.target.value)}
          placeholder="Enter manager ID"
        />
        <button onClick={fetchAppraisals}>Filter</button>
      </div>

      <hr />

      <div>
        {appraisals.map((app) => (
          <div
            key={app._id}
            style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}
          >
            <strong>Employee:</strong>{' '}
            <span
              style={{ color: 'blue', cursor: 'pointer' }}
              onClick={() => fetchUserDetails(app.userId._id)}
            >
              {app.userId.name}
            </span>{' '}
            | <strong>Manager:</strong>{' '}
            <span
              style={{ color: 'blue', cursor: 'pointer' }}
              onClick={() => fetchUserDetails(app.managerId._id)}
            >
              {app.managerId.name}
            </span>
            <br />
            <strong>Period:</strong> {app.period}<br />
            <strong>Status:</strong> {app.status}<br />
            <strong>Project:</strong> {app.projectName}<br />
            <strong>Final Rating:</strong> {app.finalRating || 'N/A'}<br />
            <strong>Manager Comment:</strong> {app.managerComment || 'N/A'}<br />
          </div>
        ))}
      </div>

      {userDetails && (
        <div style={{ marginTop: '2rem', backgroundColor: '#f4f4f4', padding: '1rem' }}>
          <h3>User Details</h3>
          <p><strong>Name:</strong> {userDetails.name}</p>
          <p><strong>Email:</strong> {userDetails.email}</p>
          <p><strong>Role:</strong> {userDetails.role}</p>
          <button onClick={() => setUserDetails(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AdminAppraisalPage;
