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
exports.reviewAppraisal = async (req, res) => {
  const { id } = req.params;
  const { managerComment, finalRating } = req.body;

  try {
    const appraisal = await Appraisal.findById(id);

    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }

    // Optional: Check if logged-in manager matches appraisal.managerId
    if (appraisal.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to review this appraisal' });
    }

    appraisal.managerComment = managerComment;
    appraisal.finalRating = finalRating;
    appraisal.status = 'reviewed';
    appraisal.reviewedAt = new Date();

    const updated = await appraisal.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to review appraisal', error });
  }
};

// 3. Reject an appraisal
exports.rejectAppraisal = async (req, res) => {
  const { id } = req.params;
  const { managerComment } = req.body;

  try {
    const appraisal = await Appraisal.findById(id);

    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }

    if (appraisal.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to reject this appraisal' });
    }

    appraisal.status = 'rejected';
    appraisal.managerComment = managerComment;
    appraisal.reviewedAt = new Date();

    const updated = await appraisal.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject appraisal', error });
  }
};
