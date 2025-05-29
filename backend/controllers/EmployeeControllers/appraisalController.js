const Appraisal = require('../../models/Appraisal');
const User = require('../../models/User');  // Import User model

exports.createAppraisal = async (req, res) => {
  try {
    const {
      period,
      projectName,
      workSummary,
      technologiesUsed,
      achievements,
      selfRating,
      additionalComments,
      attachments,
    } = req.body;

    // Fetch user and populate 'manager' field
    const user = await User.findById(req.user._id).populate('manager');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.manager) {
      return res.status(400).json({ message: 'Manager ID not assigned to user' });
    }

    // Create appraisal with populated manager's _id
    const newAppraisal = await Appraisal.create({
      userId: req.user._id,
      managerId: user.manager._id,
      period,
      projectName,
      workSummary,
      technologiesUsed,
      achievements,
      selfRating,
      additionalComments,
      attachments,
      status: 'submitted',
      submittedAt: new Date(),
    });

    res.status(201).json(newAppraisal);
  } catch (error) {
    console.error("Appraisal creation error:", error);
    res.status(500).json({ message: 'Error creating appraisal', error: error.message });
  }
};

exports.getMyAppraisals = async (req, res) => {
  try {
    const appraisals = await Appraisal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(appraisals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appraisals', error });
  }
};
