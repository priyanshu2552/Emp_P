import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManagerAppraisal = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState('');

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    const res = await axios.get('http://localhost:5000/api/manager/appraisal', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Appraisals response:', res.data);
    setAppraisals(res.data);
  } catch (err) {
    console.error('Failed to fetch appraisals', err);
  }
};

  const handleReview = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/manager/appraisal/review/${id}`,
        {
          managerComment: comment,
          finalRating: rating,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Appraisal reviewed successfully');
      fetchAppraisals();
      setSelectedAppraisal(null);
      setComment('');
      setRating('');
    } catch (err) {
      console.error('Review failed', err);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/manager/appraisal/reject/${id}`,
        {
          managerComment: comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Appraisal rejected');
      fetchAppraisals();
      setSelectedAppraisal(null);
      setComment('');
      setRating('');
    } catch (err) {
      console.error('Rejection failed', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Manager Appraisal Dashboard</h2>
      {appraisals.length === 0 ? (
        <p>No appraisals assigned to you yet.</p>
      ) : (
        <ul>
          {appraisals.map((a) => (
            <li key={a._id} style={{ marginBottom: '10px' }}>
              <strong>Employee:</strong> {typeof a.userId === 'object' ? a.userId.name : a.userId} <br />
              <strong>Project:</strong> {a.projectName} <br />
              <strong>Status:</strong> {a.status} <br />
              <button onClick={() => setSelectedAppraisal(a)}>Review</button>
            </li>
          ))}
        </ul>
      )}

      {selectedAppraisal && (
        <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
          <h3>Review Appraisal</h3>
          <p><strong>Project:</strong> {selectedAppraisal.projectName}</p>
          <textarea
            placeholder="Manager Comments"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            cols={50}
          />
          <br />
          <input
            type="number"
            placeholder="Final Rating (1-5)"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            min={1}
            max={5}
          />
          <br /><br />
          <button onClick={() => handleReview(selectedAppraisal._id)}>Submit Review</button>
          <button onClick={() => handleReject(selectedAppraisal._id)} style={{ marginLeft: '10px', color: 'red' }}>
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default ManagerAppraisal;
