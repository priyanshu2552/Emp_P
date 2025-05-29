import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000/api/manager';

const ManagerPolicyPage = () => {
  const [policies, setPolicies] = useState([]);
  const token = localStorage.getItem('token');

  const fetchPolicies = async () => {
    try {
      const res = await fetch(`${API_BASE}/policies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPolicies(data.policies);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
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
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>Company Policies</h2>
      {policies.length === 0 ? (
        <p>No policies available.</p>
      ) : (
        policies.map((policy) => (
          <div
            key={policy._id}
            style={{
              border: '1px solid #ccc',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          >
            <h4>{policy.title} (v{policy.version})</h4>
            <p>{policy.description}</p>
            <a
              href={policy.fileUrl}
              target="_blank"
              rel="noreferrer"
              download
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
              Download Policy
            </a>
            <p>Status: {policy.isRead ? '✅ Read' : '❌ Not Read'}</p>
            {!policy.isRead && (
              <button onClick={() => markAsRead(policy._id)}>Mark as Read</button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ManagerPolicyPage;
