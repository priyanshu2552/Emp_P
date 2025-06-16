const express = require('express');
const multer = require('multer');
const router = express.Router();
const managerProfile = require('../controllers/ManagerControllers/managerProfile');

const policyController = require('../controllers/ManagerControllers/managerPolicy');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const managerExpense = require('../controllers/ManagerControllers/managerExpense');
const managerLeave = require('../controllers/ManagerControllers/managerLeave');
const managerReview= require('../controllers/ManagerControllers/managerReview');
const { getEmployeeDetailsById } = require('../controllers/ManagerControllers/managerReview');
const managerController = require('../controllers/ManagerControllers/managerAppraisal');
const adminExpense = require('../controllers/ManagerControllers/managerExpense');

router.use(authMiddleware.protect);

// ----- Image Upload -----
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ----- Profile Routes -----
router.get(
  '/:userId/profile-image',
  managerProfile.getProfileImage
);
router.get('/profile', managerProfile.getManagerProfile);
router.put('/update-profile', managerProfile.updateManagerProfile);
router.put(
  '/profile/image',
  upload.single('profileImage'),
  managerProfile.uploadProfileImage
);

// ----- Employee Management -----
router.get('/employees', managerProfile.getEmployeesUnderManager);
router.get('/employee/:id', managerProfile.getEmployeeDetails);

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
router.route('/reviews')
  .get(authMiddleware.protect, managerReview.getAssignedReviews);

router.route('/reviews/:id')
  .put(authMiddleware.protect, managerReview.submitManagerReview);

router.route('/team')
  .get(authMiddleware.protect, managerReview.getTeamMembers);


// ----- Appraisals -----
router.get('/team', managerController.getMyTeam);

// Appraisal management
router.post('/appraisals/send', managerController.sendAppraisalForm);
router.get('/appraisals', managerController.getTeamAppraisals);
router.get('/appraisals/:id', managerController.getAppraisalDetails);
router.put('/appraisals/:id/review', managerController.reviewAppraisal);

module.exports = router;