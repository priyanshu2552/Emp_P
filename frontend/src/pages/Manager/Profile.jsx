import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManagerProfilePage = () => {
    const [manager, setManager] = useState({});
    const [employees, setEmployees] = useState([]);
    const [showEmployeeList, setShowEmployeeList] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [totalPendingAppraisals, setTotalPendingAppraisals] = useState(0);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [loadingEmployeeDetails, setLoadingEmployeeDetails] = useState(false);
    const navigate=useNavigate();
    const [error, setError] = useState(null);

    // Setup axios instance with base URL and Authorization header
    const axiosInstance = axios.create({
        baseURL: 'http://localhost:5000/api/manager',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });

    // Fetch manager profile on component mount
    useEffect(() => {
        fetchManagerProfile();
    }, []);

    const fetchManagerProfile = async () => {
        try {
            setError(null);
            setLoadingProfile(true);
            const res = await axiosInstance.get('/profile');
            setManager(res.data.manager);
            setTotalPendingAppraisals(res.data.totalPendingAppraisals || 0);
            setFormData(res.data.manager);
        } catch (err) {
            setError('Error fetching manager profile');
        } finally {
            setLoadingProfile(false);
        }
    };


    const fetchEmployees = async () => {
        try {
            setError(null);
            setLoadingEmployees(true);
            const res = await axiosInstance.get('/employees');
            setEmployees(res.data.employees);
            setShowEmployeeList(true);
        } catch (err) {
            setError('Error fetching employees');
        } finally {
            setLoadingEmployees(false);
        }
    };

    const fetchEmployeeDetails = async (id) => {
        try {
            setError(null);
            setLoadingEmployeeDetails(true);
            const res = await axiosInstance.get(`/employee/${id}`);
            setSelectedEmployee(res.data.employee);
        } catch (err) {
            setError('Error fetching employee details');
        } finally {
            setLoadingEmployeeDetails(false);
        }
    };

    const updateProfile = async () => {
        // Simple validation example
        if (!formData.name || formData.name.trim() === '') {
            alert('Name cannot be empty');
            return;
        }

        try {
            setError(null);
            await axiosInstance.put('/update-profile', {
                name: formData.name,
                contact: formData.contact,
                address: formData.address,
            });
            alert('Profile updated successfully');
            setEditMode(false);
            fetchManagerProfile();
        } catch (err) {
            setError('Error updating profile');
        }
    };

    const goToAppraisals = () => {
        // Replace this with your routing logic, e.g., useHistory or useNavigate
        alert('Navigate to Appraisals page');
        navigate('/manager/appraisal');
        
    };

    return (
        <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
            <h1>Manager Profile</h1>

            {error && (
                <p style={{ color: 'red' }}>{error}</p>
            )}

            {loadingProfile ? (
                <p>Loading profile...</p>
            ) : !editMode ? (
                <div>
                    <p><b>Name:</b> {manager.name || '-'}</p>
                    <p><b>Email:</b> {manager.email || '-'}</p>
                    <p><b>Role:</b> {manager.role || '-'}</p>
                    <p><b>Contact:</b> {manager.contact || '-'}</p>
                    <p><b>Address:</b> {manager.address || '-'}</p>
                    <button onClick={() => setEditMode(true)}>Edit Profile</button>
                </div>
            ) : (
                <div>
                    <div>
                        <label>Name: </label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Contact: </label>
                        <input
                            type="text"
                            value={formData.contact || ''}
                            onChange={e => setFormData({ ...formData, contact: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Address: </label>
                        <input
                            type="text"
                            value={formData.address || ''}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                    <button onClick={updateProfile}>Save</button>
                    <button onClick={() => setEditMode(false)} style={{ marginLeft: 10 }}>Cancel</button>
                </div>
            )}

            <hr style={{ margin: '20px 0' }} />

            <div>
                <div
                    style={{ cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={fetchEmployees}
                >
                    Employees: {loadingEmployees ? 'Loading...' : employees.length > 0 ? employees.length : 'Click to load'}
                </div>
                <div
                    style={{ cursor: 'pointer', marginTop: 10, fontWeight: 'bold' }}
                    onClick={goToAppraisals}
                >
                    Pending Appraisals: {totalPendingAppraisals} (Click to view)
                </div>
            </div>

            {showEmployeeList && (
                <div style={{ marginTop: 20, border: '1px solid gray', padding: 10, borderRadius: 5 }}>
                    <h3>Employees List</h3>
                    {employees.length === 0 ? (
                        <p>No employees found.</p>
                    ) : (
                        employees.map(emp => (
                            <div
                                key={emp._id}
                                onClick={() => fetchEmployeeDetails(emp._id)}
                                style={{ padding: 8, borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                            >
                                {emp.name} - {emp.email}
                            </div>
                        ))
                    )}
                </div>
            )}

            {selectedEmployee && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0,
                        width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setSelectedEmployee(null)} // close when clicking outside box
                >
                    <div
                        onClick={e => e.stopPropagation()} // prevent close when clicking inside box
                        style={{
                            backgroundColor: 'white',
                            padding: 20,
                            borderRadius: 5,
                            width: 320,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.26)',
                        }}
                    >
                        <h3>Employee Details</h3>
                        {loadingEmployeeDetails ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                <p><b>Name:</b> {selectedEmployee.name || '-'}</p>
                                <p><b>Email:</b> {selectedEmployee.email || '-'}</p>
                                <p><b>Contact:</b> {selectedEmployee.contact || '-'}</p>
                                <p><b>Address:</b> {selectedEmployee.address || '-'}</p>
                                <button onClick={() => setSelectedEmployee(null)}>Close</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerProfilePage;
