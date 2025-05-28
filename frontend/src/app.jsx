import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Auth/Login';
import EmployeeDashboard from './pages/Dashboard/EmployeeDashboard';
import ManagerDashboard from './pages/Dashboard/ManagerDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import EmployeeProfile from './pages/Employee/Profile'; // Import the profile page
import ExpenseTracker from './pages/Employee/Expense';
import Leave from './pages/Employee/Leave';
import EmployeeReviews from './pages/Employee/Review';
import EmployeePolicyPage from './pages/Employee/Policy';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/employee/profile" element={<EmployeeProfile />} /> {/* Added profile route */}
        <Route path="/employee/expense" element={<ExpenseTracker />} />
        <Route path="/employee/leave" element={<Leave />} />
        <Route path="/employee/review" element={<EmployeeReviews />} />
        <Route path="/employee/policy" element={<EmployeePolicyPage />} />
        </Routes>
    </Router>
  );
}

export default App;
