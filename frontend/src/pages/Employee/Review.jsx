import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000/api/employees';

const EmployeeReviews = () => {
  const [reviews, setReviews] = useState([]);
  const token = localStorage.getItem('token');

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>Your Weekly Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((review) => (
            <div
              key={review._id}
              style={{
                border: '1px solid #ccc',
                padding: '1rem',
                borderRadius: '8px',
              }}
            >
              <p><strong>Manager:</strong> {review.managerId?.name || 'N/A'}</p>
              <p><strong>Week:</strong> {new Date(review.weekStartDate).toLocaleDateString()} - {new Date(review.weekEndDate).toLocaleDateString()}</p>
              <p><strong>Accomplishments:</strong></p>
              <ul>
                {review.accomplishments.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
              <p><strong>Feedback:</strong> {review.feedback}</p>
              <p><strong>Rating:</strong> {review.rating} / 5</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeReviews;
