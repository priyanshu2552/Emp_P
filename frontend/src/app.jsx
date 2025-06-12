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
import AppraisalForm from './pages/Employee/Appraisal';
import ManagerProfilePage from './pages/Manager/Profile';
import ManagerPolicyPage from './pages/Manager/Policy';
import ExpenseTracker1 from './pages/Manager/Expense';
import ManagerLeave from './pages/Manager/Leave';
import ManagerReviewDashboard from './pages/Manager/Review';
import ManagerAppraisal from './pages/Manager/Appraisal';

import AdminUsers from './pages/Admin/AdminUsers';
import AdminExpenses from './pages/Admin/AdminExpense';
import AdminLeave from './pages/Admin/AdminLeave';
import AdminPolicies from './pages/Admin/AdminPolicies';
import AdminAppraisalPage from './pages/Admin/AdminAppraisal';
import WeeklyReviewAdminPage from './pages/Admin/AdminReview';
import AdminLayout from './components/Layout/AdminLayout';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/employee/profile" element={<EmployeeProfile />} /> {/* Added profile route */}
        <Route path="/employee/expense" element={<ExpenseTracker />} />
        <Route path="/employee/leave" element={<Leave />} />
        <Route path="/employee/review" element={<EmployeeReviews />} />
        <Route path="/employee/policy" element={<EmployeePolicyPage />} />
        <Route path="/employee/appraisal" element={<AppraisalForm />} />
        <Route path="/manager/profile" element={<ManagerProfilePage />} />
        <Route path="/manager/policy" element={<ManagerPolicyPage />} />
        <Route path="/manager/expense" element={<ExpenseTracker1 />} />
        <Route path="/manager/leave" element={<ManagerLeave />} />
        <Route path="/manager/review" element={<ManagerReviewDashboard />} />
        <Route path="/manager/appraisal" element={<ManagerAppraisal />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="users" element={<AdminUsers />} />
          <Route path="policies" element={<AdminPolicies />} />
          <Route path="expenses" element={<AdminExpenses />} />
          <Route path="leaves" element={<AdminLeave />} />
          <Route path="appraisal" element={<AdminAppraisalPage />} />
          <Route path="review" element={<WeeklyReviewAdminPage />} />
          {/* Add other admin routes here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
