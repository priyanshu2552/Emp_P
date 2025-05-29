import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000/api/manager';

const ManagerReviewDashboard = () => {
    const token = localStorage.getItem('token');
    const [employees, setEmployees] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        employeeId: '',
        weekStartDate: '',
        weekEndDate: '',
        accomplishments: '',
        feedback: '',
        rating: 3,
    });

    const fetchEmployees = async () => {
        try {
            const res = await fetch(`${API_BASE}/employees`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (Array.isArray(data.employees)) setEmployees(data.employees);
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${API_BASE}/reviews`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setReviews(data.reviews);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    const fetchEmployeeDetails = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/employee/details/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setSelectedEmployee(data.employee);
        } catch (err) {
            console.error('Error fetching employee details:', err);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchReviews();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const body = {
            ...formData,
            accomplishments: formData.accomplishments.split(',').map((item) => item.trim()),
        };

        try {
            const res = await fetch(`${API_BASE}/review/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                alert('Review submitted!');
                fetchReviews();
                setFormData({
                    employeeId: '',
                    weekStartDate: '',
                    weekEndDate: '',
                    accomplishments: '',
                    feedback: '',
                    rating: 3,
                });
            } else {
                alert('Failed to submit review');
            }
        } catch (err) {
            console.error('Error submitting review:', err);
        }
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
            <h2>Manager Review Dashboard</h2>

            <section style={{ marginBottom: '2rem' }}>
                <h3>Submit Weekly Review</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <select
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        required
                    >
                        <option value="">Select Employee</option>
                        {employees.map((emp) => (
                            <option key={emp._id} value={emp._id}>
                                {emp.name} ({emp.email})
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={formData.weekStartDate}
                        onChange={(e) => setFormData({ ...formData, weekStartDate: e.target.value })}
                        required
                    />
                    <input
                        type="date"
                        value={formData.weekEndDate}
                        onChange={(e) => setFormData({ ...formData, weekEndDate: e.target.value })}
                        required
                    />

                    <textarea
                        placeholder="Accomplishments (comma separated)"
                        value={formData.accomplishments}
                        onChange={(e) => setFormData({ ...formData, accomplishments: e.target.value })}
                        required
                    />

                    <textarea
                        placeholder="Feedback"
                        value={formData.feedback}
                        onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                        required
                    />

                    <label>
                        Rating:
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={formData.rating}
                            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                            required
                            style={{ marginLeft: '1rem' }}
                        />
                    </label>

                    <button type="submit" style={{ padding: '0.5rem 1rem' }}>
                        Submit Review
                    </button>
                </form>
            </section>

            <section>
                <h3>Previous Reviews</h3>
                {reviews.length === 0 ? (
                    <p>No reviews submitted yet.</p>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review._id}
                            style={{
                                border: '1px solid #ccc',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                cursor: 'pointer',
                            }}
                            onClick={() => fetchEmployeeDetails(review.employeeId._id)}
                        >
                            <p><strong>Employee:</strong> {review.employeeId?.name}</p>
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
                    ))
                )}
            </section>

            {selectedEmployee && (
                <section style={{ marginTop: '2rem', borderTop: '2px solid #ccc', paddingTop: '1rem' }}>
                    <h3>Employee Details</h3>
                    <p><strong>Name:</strong> {selectedEmployee.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedEmployee.email || 'N/A'}</p>
                    <p><strong>Contact:</strong> {selectedEmployee.contact || 'N/A'}</p>
                    <p><strong>Address:</strong> {selectedEmployee.address || 'N/A'}</p>
                    <p><strong>Role:</strong> {selectedEmployee.role || 'N/A'}</p>
                    <p><strong>Manager ID:</strong> {selectedEmployee.manager || 'N/A'}</p>
                    <p><strong>Date of Joining:</strong> {selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : 'N/A'}</p>

                    <button onClick={() => setSelectedEmployee(null)} style={{ marginTop: '1rem' }}>
                        Close
                    </button>
                </section>
            )}
        </div>
    );
};

export default ManagerReviewDashboard;
