const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/EmployeeControllers/employeeProfile');
const employeeExpense = require('../controllers/EmployeeControllers/employeeExpense');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const employeeLeave = require('../controllers/EmployeeControllers/employeeLeave');
const employeeReview = require('../controllers/EmployeeControllers/employeeReview');
const policyController = require('../controllers/EmployeeControllers/employeePolicy');
const { createAppraisal, getMyAppraisals } = require('../controllers/EmployeeControllers/appraisalController');
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
// -------Leaves-----
router.post('/leaves', authMiddleware.protect, employeeLeave.submitLeave);
router.get('/leaves', authMiddleware.protect, employeeLeave.getUserLeaves);

// ---------Review-----
router.get('/reviews', authMiddleware.protect, employeeReview.getEmployeeReviews);

//---------Pilicies------
router.get('/policies', authMiddleware.protect, policyController.getAllPolicies);
router.post('/policies/ack', authMiddleware.protect, policyController.markAsRead);
// In employeeRoutes.js
router.get('/policies/:id/download', authMiddleware.protect, policyController.downloadPolicy);
router.get('/policies/:id/text', authMiddleware.protect, policyController.getPolicyText);

//---------Appraisals---------
router.post('/appraisal', authMiddleware.protect, createAppraisal);
router.get('/appraisal', authMiddleware.protect, getMyAppraisals);


module.exports = router;
