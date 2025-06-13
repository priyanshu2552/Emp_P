const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/EmployeeControllers/employeeProfile');
const employeeExpense = require('../controllers/EmployeeControllers/employeeExpense');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const employeeLeaveController = require('../controllers/EmployeeControllers/employeeLeave');
// using the updated one
const employeeReview = require('../controllers/EmployeeControllers/employeeReview');
const policyController = require('../controllers/EmployeeControllers/employeePolicy');
const {
  getCurrentAppraisal,
  updateSelfEvaluation,
  submitAppraisal
} = require('../controllers/EmployeeControllers/appraisalController');
const multer = require('multer');

//-----image Upload things-------
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
router.put(
  '/profile/image',
  authMiddleware.protect,
  upload.single('profileImage'),
  employeeController.uploadProfileImage
);

router.get(
  '/:userId/profile-image',
  employeeController.getProfileImage
);

// ----- Employee Profile Routes -----

// Get employee profile
router.get('/profile', authMiddleware.protect, employeeController.getEmployeeProfile);

// Update employee profile (with optional image upload)
router.put(
  '/profile',
  authMiddleware.protect,
  uploadMiddleware.single('profileImage'),
  employeeController.updateEmployeeProfile
);

// Get managers list for dropdown
router.get('/managers', authMiddleware.protect, employeeController.getManagersList);

// ----- Expense Routes -----

// Submit a new expense
router.post(
  '/expenses',
  authMiddleware.protect,
  upload.single('receipt'), // This should match the field name in FormData
  employeeExpense.submitExpense
);
// Get all expenses for the logged-in user (with filters and pagination)
router.get('/expenses', authMiddleware.protect, employeeExpense.getUserExpenses);
router.get(
  '/expenses/download',
  authMiddleware.protect,
  employeeExpense.downloadExpenses
);
router.get(
  '/expenses/:id/receipt',
  authMiddleware.protect,
  employeeExpense.viewReceipt
);

// ------- Updated Leave Routes --------
router.get('/leave/balance', authMiddleware.protect, employeeLeaveController.getLeaveBalance);

// Get leave history
router.get('/leave/history', authMiddleware.protect, employeeLeaveController.getLeaveHistory);

// Create leave request
router.post('/leave/request', authMiddleware.protect, employeeLeaveController.createLeaveRequest);

// Cancel leave request
router.put('/leave/request/:id/cancel', authMiddleware.protect, employeeLeaveController.cancelLeaveRequest);

// ---------Review-----
router.get('/reviews', authMiddleware.protect, employeeReview.getEmployeeReviews);

//---------Policies------
router.get('/policies', authMiddleware.protect, policyController.getAllPolicies);
router.post('/policies/ack', authMiddleware.protect, policyController.markAsRead);
router.get('/policies/:id/download', authMiddleware.protect, policyController.downloadPolicy);
router.get('/policies/:id/text', authMiddleware.protect, policyController.getPolicyText);

console.log('Employee routes loaded');
//---------Appraisals---------
router.get('/appraisal',authMiddleware.protect, authMiddleware.authorize('employee'), getCurrentAppraisal);
router.put('/appraisal',authMiddleware.protect, authMiddleware.authorize('employee'), updateSelfEvaluation);
router.post('/appraisal/submit',authMiddleware.protect, authMiddleware.authorize('employee'), submitAppraisal);


module.exports = router;
