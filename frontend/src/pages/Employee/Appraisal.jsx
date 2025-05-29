import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AppraisalFormAndList = () => {
  const [formData, setFormData] = useState({
    period: '',
    projectName: '',
    workSummary: '',
    technologiesUsed: '',
    achievements: '',
    selfRating: '',
    additionalComments: '',
    attachments: '',
  });

  const [appraisals, setAppraisals] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch earlier appraisals on component mount
  useEffect(() => {
    const fetchAppraisals = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/api/employees/appraisal',  // adjust if needed
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setAppraisals(response.data);
      } catch (err) {
        setError('Failed to fetch appraisals');
      }
    };
    fetchAppraisals();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const dataToSend = {
      ...formData,
      technologiesUsed: formData.technologiesUsed.split(',').map(s => s.trim()),
      achievements: formData.achievements.split(',').map(s => s.trim()),
      attachments: formData.attachments ? formData.attachments.split(',').map(s => s.trim()) : [],
      selfRating: {
        technicalSkills: Number(formData.selfRating) || 3,
        communication: Number(formData.selfRating) || 3,
        teamwork: Number(formData.selfRating) || 3,
      }
    };

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/employees/appraisal',
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );

      setMessage('Appraisal created successfully!');
      setAppraisals(prev => [response.data, ...prev]); // prepend new appraisal
      setFormData({
        period: '',
        projectName: '',
        workSummary: '',
        technologiesUsed: '',
        achievements: '',
        selfRating: '',
        additionalComments: '',
        attachments: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating appraisal');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto', padding: 20 }}>
      <h2>Create Appraisal</h2>
      <form onSubmit={handleSubmit}>

        <label>Period (e.g. Q1 2025):</label><br/>
        <input type="text" name="period" value={formData.period} onChange={handleChange} required /><br/><br/>

        <label>Project Name:</label><br/>
        <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} /><br/><br/>

        <label>Work Summary:</label><br/>
        <textarea name="workSummary" value={formData.workSummary} onChange={handleChange} /><br/><br/>

        <label>Technologies Used (comma separated):</label><br/>
        <input type="text" name="technologiesUsed" value={formData.technologiesUsed} onChange={handleChange} /><br/><br/>

        <label>Achievements (comma separated):</label><br/>
        <input type="text" name="achievements" value={formData.achievements} onChange={handleChange} /><br/><br/>

        <label>Self Rating (1-5):</label><br/>
        <input type="number" min="1" max="5" name="selfRating" value={formData.selfRating} onChange={handleChange} /><br/><br/>

        <label>Additional Comments:</label><br/>
        <textarea name="additionalComments" value={formData.additionalComments} onChange={handleChange} /><br/><br/>

        <label>Attachments (comma separated URLs):</label><br/>
        <input type="text" name="attachments" value={formData.attachments} onChange={handleChange} /><br/><br/>

        <button type="submit">Submit Appraisal</button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <hr />

      <h3>Earlier Appraisals</h3>
      {appraisals.length === 0 ? (
        <p>No appraisals found.</p>
      ) : (
        <ul>
          {appraisals.map(app => (
            <li key={app._id} style={{ marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>
              <b>Period:</b> {app.period} <br/>
              <b>Project Name:</b> {app.projectName} <br/>
              <b>Work Summary:</b> {app.workSummary} <br/>
              <b>Technologies Used:</b> {app.technologiesUsed?.join(', ')} <br/>
              <b>Achievements:</b> {app.achievements?.join(', ')} <br/>
              <b>Self Rating:</b> {JSON.stringify(app.selfRating)} <br/>
              <b>Additional Comments:</b> {app.additionalComments} <br/>
              <b>Attachments:</b> {app.attachments?.join(', ')} <br/>
              <b>Status:</b> {app.status} <br/>
              <b>Submitted At:</b> {new Date(app.submittedAt).toLocaleString()} <br/>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AppraisalFormAndList;
