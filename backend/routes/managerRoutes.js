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

// All routes are protected — only accessible after login

//-----imGE uPLOAD PART------
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
// Profile routes
// In managerRoutes.js
router.get(
  '/:userId/profile-image',  // Changed from '/:userId/manager-profile-image'
  getProfileImage
);


router.get(
    '/profile',
    getManagerProfile
);
router.put('/update-profile',authMiddleware.protect, updateManagerProfile);
router.put(
  '/profile/image',
  authMiddleware.protect,
  upload.single('profileImage'),
  uploadProfileImage
);
// Employee management routes
router.get('/employees', getEmployeesUnderManager);
router.get('/employee/:id', getEmployeeDetails);


router.get('/policies', authMiddleware.protect, policyController.getAllPolicies);
router.post('/policies/ack', authMiddleware.protect, policyController.markAsRead);
router.get('/policies/:id/download', authMiddleware.protect, policyController.downloadPolicy);
router.get('/policies/:id/text', authMiddleware.protect, policyController.getPolicyText);

router.get('/expenses/team', authMiddleware.protect, managerExpense.getTeamExpenses);
router.put('/expenses/review/:expenseId', authMiddleware.protect, managerExpense.reviewExpense);
router.get(
  '/expenses/:expenseId/receipt',  // Changed from '/expenses/receipt/:expenseId'
  authMiddleware.protect,
  managerExpense.getExpenseReceipt
);

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
