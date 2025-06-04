const Appraisal = require('../../models/Appraisal');

// 1. Get all appraisals assigned to the logged-in manager

exports.getManagerAppraisals = async (req, res) => {
  try {
    const managerId = req.user.id;  // Assumes auth middleware sets req.user.id

    // Fetch all appraisals assigned to this manager
    const appraisals = await Appraisal.find({ managerId })
      .populate('userId', 'name email')  // Populate employee details
      .sort({ createdAt: -1 });

    res.status(200).json(appraisals);
  } catch (error) {
    console.error('Error fetching appraisals:', error);
    res.status(500).json({ message: 'Server error fetching appraisals' });
  }
};

// 2. Review and approve an appraisal
// controllers/ManagerControllers/managerAppraisal.js

exports.reviewAppraisal = async (req, res) => {
  try {
    const { managerComment, finalRating } = req.body;
    
    if (!managerComment || !finalRating) {
      return res.status(400).json({ message: 'Manager comment and final rating are required' });
    }

    const appraisal = await Appraisal.findById(req.params.id)
      .populate('userId', 'name email image')
      .populate('managerId', 'name');

    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }

    if (appraisal.managerId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to review this appraisal' });
    }

    if (appraisal.status !== 'Submitted' && appraisal.status !== 'submitted') {
      return res.status(400).json({ message: 'Appraisal is not in a reviewable state' });
    }

    appraisal.managerComment = managerComment;
    appraisal.finalRating = finalRating;
    appraisal.status = 'reviewed'; // Make sure this matches your schema
    appraisal.reviewedAt = new Date();

    await appraisal.save();
    res.status(200).json(appraisal);
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ message: 'Failed to review appraisal', error: error.message });
  }
};

exports.rejectAppraisal = async (req, res) => {
  try {
    const { managerComment } = req.body;
    
    if (!managerComment) {
      return res.status(400).json({ message: 'Manager comment is required' });
    }

    const appraisal = await Appraisal.findById(req.params.id)
      .populate('userId', 'name email image')
      .populate('managerId', 'name');

    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }

    if (appraisal.managerId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to reject this appraisal' });
    }

    if (appraisal.status !== 'Submitted' && appraisal.status !== 'submitted') {
      return res.status(400).json({ message: 'Appraisal is not in a rejectable state' });
    }

    appraisal.managerComment = managerComment;
    appraisal.status = 'rejected'; // Make sure this matches your schema
    appraisal.reviewedAt = new Date();

    await appraisal.save();
    res.status(200).json(appraisal);
  } catch (error) {
    console.error('Rejection error:', error);
    res.status(500).json({ message: 'Failed to reject appraisal', error: error.message });
  }
};