const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Controllers
const adminAppraisalController = require('../controllers/AdminControllers/adminAppraisal');
const { getAdminDashboardData } = require('../controllers/AdminControllers/adminDashboard');
const { getUsers, addUser, deleteUser } = require('../controllers/AdminControllers/adminManageUser');
const expenseController = require('../controllers/AdminControllers/adminExpense');
const { getAllLeaves, updateLeaveStatus } = require('../controllers/AdminControllers/adminLeave');
const { addPolicy, getAllPolicies, updatePolicy } = require('../controllers/AdminControllers/adminPolicies');
const weeklyReviewController = require('../controllers/AdminControllers/adminWeeklyReview');

// 🔐 Middleware to protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// ==============================
// User Management
// ==============================
router.get('/users', getUsers);
router.post('/users', addUser);
router.delete('/users/:id', deleteUser);

// ==============================
// Expense Management
// ==============================
router.get('/expenses', expenseController.getExpenses);
router.put('/expenses/:id', expenseController.updateExpenseStatus);

// ==============================
// Dashboard
// ==============================
router.get('/dashboard', getAdminDashboardData);

// ==============================
// Leave Management
// ==============================
router.get('/leaves', getAllLeaves);
router.put('/leaves/:id', updateLeaveStatus);

// ==============================
// File Upload Setup (for Policies)
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/policies'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('Only PDFs allowed'), false);
  }
});

// ==============================
// Policy Management
// ==============================
router.get('/policies', getAllPolicies);
router.post('/policies', upload.single('pdf'), addPolicy);
router.put('/policies/:id', upload.single('pdf'), updatePolicy);

// ==============================
// Appraisal Management
// ==============================
router.get('/appraisals', adminAppraisalController.getAllAppraisals);
router.get('/user/:id', adminAppraisalController.getUserDetails);

// ==============================
// Weekly Review Management
// ==============================
router.get('/weekly-reviews', weeklyReviewController.getAllWeeklyReviews);
router.get('/weekly-reviews/user/:id', weeklyReviewController.getUserDetails); // Separate from /user/:id to avoid route conflict

module.exports = router;
