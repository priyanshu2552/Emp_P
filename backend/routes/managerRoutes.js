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
  getManagerAppraisals,
  reviewAppraisal,
  rejectAppraisal
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
router.post('/leaves', managerLeave.submitLeave); // Manager submitting their own leave
router.get('/leaves', managerLeave.getUserLeaves); // Manager viewing own leaves
router.get('/team-leaves', managerLeave.getTeamLeaves); // Manager viewing team pending leaves
router.post('/leaves/:id/review', managerLeave.reviewLeave); // Approve/Reject team leaves
router.get('/leave-allocation', managerLeave.getLeaveAllocation); // Get leave allocation

// ----- Reviews -----
router.get('/employees', getEmployeesForManager);
router.post('/review/submit', submitReview);
router.get('/reviews', getManagerReviews);
router.get('/employee/details/:id', getEmployeeDetailsById);

// ----- Appraisals -----
router.get('/appraisal', getManagerAppraisals);
router.put('/appraisal/review/:id', reviewAppraisal);
router.put('/appraisal/reject/:id', rejectAppraisal);

module.exports = router;