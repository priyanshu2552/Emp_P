const express = require('express');
const pdf = require('pdf-parse');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { GridFsStorage } = require('multer-gridfs-storage');

// Controllers
const {
  getAllAppraisals,
  getAppraisalsByEmployee,
  createAppraisalTemplate
} = require('../controllers/AdminControllers/adminAppraisal');
const { getAdminDashboardData } = require('../controllers/AdminControllers/adminDashboard');
const { getUsers, addUser, deleteUser } = require('../controllers/AdminControllers/adminManageUser');
const expenseController = require('../controllers/AdminControllers/adminExpense');
const {
  getAllLeaves,
  processLeaveRequest,
  getLeavePolicy,
  updateLeavePolicy,
  resetYearlyAllocations
} = require('../controllers/AdminControllers/adminLeave');

const { addPolicy, getAllPolicies, updatePolicy, deletePolicy, getPolicyFile } = require('../controllers/AdminControllers/adminPolicies');
const weeklyReviewController = require('../controllers/AdminControllers/adminWeeklyReview');
const { MongoClient, ObjectId } = require('mongodb');
const { GridFSBucket } = require('mongodb');
const Policy = require('../models/Policy');

const client = new MongoClient(process.env.MONGO_URI);
let db, bucket;

async function connectDB() {
  await client.connect();
  db = client.db();
  bucket = new GridFSBucket(db, { bucketName: 'policies' });
}
router.use(protect);
router.use(authorize('admin'));
connectDB().catch(console.error);

// Middleware to handle file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// File upload handler
async function handleFileUpload(file) {
  return new Promise((resolve, reject) => {
    const filename = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype
    });

    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.on('error', reject);
    uploadStream.end(file.buffer);
  });
}

// File download handler
async function handleFileDownload(fileId, res) {
  try {
    const _id = new ObjectId(fileId);
    const files = await bucket.find({ _id }).toArray();

    if (!files.length) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.set('Content-Type', files[0].contentType);
    res.set('Content-Disposition', `attachment; filename="${files[0].filename}"`);
    bucket.openDownloadStream(_id).pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving file' });
  }
}

// File delete handler
async function handleFileDelete(fileId) {
  const db = await connectToMongo();
  const bucket = new GridFSBucket(db, { bucketName: 'policies' });

  return new Promise((resolve, reject) => {
    // First check if file exists
    bucket.find({ _id: new ObjectId(fileId) }).toArray((err, files) => {
      if (err) return reject(err);
      if (!files.length) {
        console.warn(`File ${fileId} not found in GridFS - skipping deletion`);
        return resolve(); // Resolve instead of reject for missing files
      }

      // If file exists, delete it
      bucket.delete(new ObjectId(fileId), (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

// 🔐 Middleware to protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// ==============================
// Policy Management
// ==============================
router.get('/policies', async (req, res) => {
  try {
    console.log('Fetching policies...');
    const policies = await Policy.find().populate('createdBy', 'name email');
    console.log('Policies found:', policies.length);
    res.json({ success: true, policies });
  } catch (err) {
    console.error('Error fetching policies:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

router.post('/policies', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF file is required' });
    }

    const fileId = await handleFileUpload(req.file);

    let extractedText = '';
    try {
      const data = await pdf(req.file.buffer);
      extractedText = data.text;
    } catch (err) {
      console.error('Error extracting text from PDF:', err);
    }

    const { title, description } = req.body;

    const newPolicy = new Policy({
      title,
      description,
      fileId,
      contentType: req.file.mimetype,
      extractedText,
      createdBy: req.user._id,
    });

    await newPolicy.save();
    res.status(201).json({ success: true, policy: newPolicy });
  } catch (err) {
    console.error('Error uploading policy:', err);
    res.status(500).json({
      success: false,
      message: 'Error uploading policy',
      error: err.message
    });
  }
});

router.put('/policies/:id', upload.single('pdf'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    if (req.file) {
      if (policy.fileId) {
        await handleFileDelete(policy.fileId);
      }
      policy.fileId = await handleFileUpload(req.file);
      policy.contentType = req.file.mimetype;
    }

    policy.title = title || policy.title;
    policy.description = description || policy.description;
    policy.version += 1;
    policy.updatedAt = Date.now();

    await policy.save();
    res.json({ success: true, policy });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating policy' });
  }
});

router.delete('/policies/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid policy ID format'
      });
    }

    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    if (policy.fileId) {
      try {
        await bucket.delete(new ObjectId(policy.fileId));
      } catch (err) {
        console.warn('Error deleting file from GridFS:', err.message);
      }
    }

    await Policy.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (err) {
    console.error('Delete policy error:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting policy',
      error: err.message
    });
  }
});

router.get('/policies/:id/download', protect, authorize('admin'), async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    if (!policy.fileId) {
      return res.status(404).json({
        success: false,
        message: 'No file associated with this policy'
      });
    }

    const bucket = new GridFSBucket(db, { bucketName: 'policies' });

    const files = await bucket.find({ _id: new ObjectId(policy.fileId) }).toArray();
    if (!files.length) {
      return res.status(404).json({
        success: false,
        message: 'File not found in database'
      });
    }

    res.set('Content-Type', files[0].contentType || 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="${policy.title}.pdf"`);

    const downloadStream = bucket.openDownloadStream(new ObjectId(policy.fileId));
    downloadStream.on('error', () => {
      res.status(500).json({
        success: false,
        message: 'Error streaming file'
      });
    });
    downloadStream.pipe(res);

  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({
      success: false,
      message: 'Error downloading file',
      error: err.message
    });
  }
});

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
// Leave Management (Updated Routes)
// ==============================
router.get('/leaves', getAllLeaves);
router.put('/leaves/:id/process', processLeaveRequest);
router.get('/policy', getLeavePolicy);
router.put('/policy', updateLeavePolicy);
router.post('/reset-allocations', resetYearlyAllocations);

// ==============================
// Appraisal Management
// ==============================
router.route('/appraisals')
  .get(protect, authorize('admin'), getAllAppraisals)
  .post(protect, authorize('admin'), createAppraisalTemplate);

router.route('/appraisals/employee/:employeeId')
  .get(protect, authorize('admin'), getAppraisalsByEmployee);
// ==============================
// Weekly Review Management
// ==============================
router.get('/weekly-reviews', weeklyReviewController.getAllWeeklyReviews);
router.get('/weekly-reviews/user/:id', weeklyReviewController.getUserDetails);

module.exports = router;