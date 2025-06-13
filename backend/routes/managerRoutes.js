const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  getProfileImage,
  getEmployeesUnderManager,
  getEmployeeDetails,
  updateManagerProfile,
  uploadProfileImage,
  getManagerProfile
} = require('../controllers/ManagerControllers/managerProfile');

const policyController = require('../controllers/ManagerControllers/managerPolicy');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const managerExpense = require('../controllers/ManagerControllers/managerExpense');
const managerLeave = require('../controllers/ManagerControllers/managerLeave');
const { getEmployeesForManager, submitReview, getManagerReviews } = require('../controllers/ManagerControllers/managerReview');
const { getEmployeeDetailsById } = require('../controllers/ManagerControllers/managerReview');
const {
 getAppraisalsToReview,
  getAppraisalToReview,
  submitManagerEvaluation
} = require('../controllers/ManagerControllers/managerAppraisal');
const adminExpense = require('../controllers/ManagerControllers/managerExpense');

router.use(authMiddleware.protect);

// ----- Image Upload -----
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ----- Profile Routes -----
router.get('/:userId/profile-image', getProfileImage);
router.get('/profile', getManagerProfile);
router.put('/update-profile', updateManagerProfile);
router.put(
  '/profile/image',
  upload.single('profileImage'),
  uploadProfileImage
);

// ----- Employee Management -----
router.get('/employees', getEmployeesUnderManager);
router.get('/employee/:id', getEmployeeDetails);

// ----- Policies -----
router.get('/policies', policyController.getAllPolicies);
router.post('/policies/ack', policyController.markAsRead);
router.get('/policies/:id/download', policyController.downloadPolicy);
router.get('/policies/:id/text', policyController.getPolicyText);

// ----- Expense Management -----
router.get('/expenses/team', managerExpense.getTeamExpenses);
router.put('/expenses/review/:expenseId', managerExpense.reviewExpense);
router.get('/expenses/:expenseId/receipt', managerExpense.getExpenseReceipt);

// ----- LEAVE MANAGEMENT -----
router.get('/leaves', managerLeave.getManagerLeaves);
router.get('/leaves/team', managerLeave.getTeamLeaves);
router.get('/leaves/allocation', managerLeave.getManagerLeaveAllocation);
router.post('/leaves', managerLeave.createManagerLeave);
router.post('/leaves/:leaveId/review', managerLeave.reviewTeamLeave);


// ----- Reviews -----
router.get('/employees', getEmployeesForManager);
router.post('/review/submit', submitReview);
router.get('/reviews', getManagerReviews);
router.get('/employee/details/:id', getEmployeeDetailsById);

// ----- Appraisals -----
router.route('/appraisals')
  .get(authMiddleware.protect, authMiddleware.authorize('manager'), getAppraisalsToReview);

router.route('/appraisals/:id')
  .get(authMiddleware.protect, authMiddleware.authorize('manager'), getAppraisalToReview)
  .put(authMiddleware.protect, authMiddleware.authorize('manager'), submitManagerEvaluation)

module.exports = router;