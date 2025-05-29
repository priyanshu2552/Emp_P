const express = require('express');
const router = express.Router();
const {
  getManagerProfile,
  getEmployeesUnderManager,
  getEmployeeDetails,
  updateManagerProfile, // <-- add this here
} = require('../controllers/ManagerControllers/managerProfile');
const policyController = require('../controllers/ManagerControllers/managerPolicy');

const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const adminExpense = require('../controllers/ManagerControllers/managerExpense');
const managerLeave = require('../controllers/ManagerControllers/managerLeave');
const { getEmployeesForManager, submitReview, getManagerReviews } = require('../controllers/ManagerControllers/managerReview');
const { getEmployeeDetailsById } = require('../controllers/ManagerControllers/managerReview');
const {
  getManagerAppraisals,
  reviewAppraisal,
  rejectAppraisal
} = require('../controllers/ManagerControllers/managerAppraisal');


// All routes are protected — only accessible after login
router.get('/profile',authMiddleware.protect, getManagerProfile);
router.get('/employees', authMiddleware.protect, getEmployeesUnderManager);
router.get('/employee/:id', authMiddleware.protect, getEmployeeDetails);
router.put('/update-profile', authMiddleware.protect, updateManagerProfile);

router.get('/policies', authMiddleware.protect, policyController.getAllPolicies);
router.post('/policies/ack', authMiddleware.protect, policyController.markAsRead);

router.post('/expenses', authMiddleware.protect, adminExpense.submitExpense);
// Get all expenses for the logged-in user (with filters and pagination)
router.get('/expenses', authMiddleware.protect, adminExpense.getUserExpenses);

router.post('/leaves', authMiddleware.protect, managerLeave.submitLeave);
router.get('/leaves', authMiddleware.protect, managerLeave.getUserLeaves);



router.get('/employees', authMiddleware.protect, getEmployeesForManager);
router.post('/review/submit', authMiddleware.protect, submitReview);
router.get('/reviews', authMiddleware.protect, getManagerReviews);
router.get('/employee/details/:id', authMiddleware.protect, getEmployeeDetailsById);


router.get('/appraisal', authMiddleware.protect, getManagerAppraisals); // no managerId param
router.put('/appraisal/review/:id', authMiddleware.protect, reviewAppraisal);
router.put('/appraisal/reject/:id', authMiddleware.protect, rejectAppraisal);

module.exports = router;
