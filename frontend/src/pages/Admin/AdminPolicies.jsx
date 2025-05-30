import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pdf, setPdf] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const token = localStorage.getItem('token'); // get token from localStorage

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchPolicies = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/policies', axiosConfig);
      setPolicies(res.data.policies);
    } catch (err) {
      console.error('Error fetching policies:', err);
      alert('Failed to fetch policies.');
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || (!pdf && !selectedPolicy)) {
      alert('Title and PDF file are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (pdf) formData.append('pdf', pdf);

    try {
      if (selectedPolicy) {
        // Update existing policy
        await axios.put(
          `http://localhost:5000/api/admin/policies/${selectedPolicy._id}`,
          formData,
          axiosConfig
        );
        alert('Policy updated successfully');
      } else {
        // Add new policy
        await axios.post(
          'http://localhost:5000/api/admin/policies',
          formData,
          axiosConfig
        );
        alert('Policy uploaded successfully');
      }

      setTitle('');
      setDescription('');
      setPdf(null);
      setSelectedPolicy(null);
      fetchPolicies();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    }
  };

  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setTitle(policy.title);
    setDescription(policy.description || '');
  };

  const handleCancelEdit = () => {
    setSelectedPolicy(null);
    setTitle('');
    setDescription('');
    setPdf(null);
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '2rem' }}>
      <h2>{selectedPolicy ? 'Update Policy' : 'Upload New Policy'}</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div>
          <label>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
        </div>
        <div>
          <label>{selectedPolicy ? 'Upload New PDF (optional)' : 'Upload PDF *'}</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdf(e.target.files[0])}
            style={{ marginBottom: '1rem' }}
          />
        </div>
        <button type="submit">
          {selectedPolicy ? 'Update Policy' : 'Upload Policy'}
        </button>
        {selectedPolicy && (
          <button
            type="button"
            onClick={handleCancelEdit}
            style={{ marginLeft: '1rem' }}
          >
            Cancel
          </button>
        )}
      </form>

      <h3>Existing Policies</h3>
      {policies.length === 0 ? (
        <p>No policies found.</p>
      ) : (
        <ul>
          {policies.map((policy) => (
            <li key={policy._id} style={{ marginBottom: '1rem' }}>
              <strong>{policy.title}</strong> (v{policy.version})<br />
              {policy.description && <p>{policy.description}</p>}
              <a
                href={`http://localhost:5000${policy.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View PDF
              </a>
              <br />
              <button onClick={() => handleEdit(policy)}>Edit</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPolicies;
