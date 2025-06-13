const Appraisal = require('../../models/Appraisal');
const User = require('../../models/User');
// Get all appraisals to review
exports.getAppraisalsToReview = async (req, res) => {
  try {
    const appraisals = await Appraisal.find({
      manager: req.user._id,
      status: 'submitted'
    }).populate('employee', 'name email EmployeeId Department');
    
    res.status(200).json(appraisals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single appraisal to review
exports.getAppraisalToReview = async (req, res) => {
  try {
    const appraisal = await Appraisal.findOne({
      _id: req.params.id,
      manager: req.user._id
    }).populate('employee', 'name email EmployeeId Department');
    
    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }
    
    res.status(200).json(appraisal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit manager evaluation
exports.submitManagerEvaluation = async (req, res) => {
  try {
    const { kras, managerFeedback, actionPlan, overallRating } = req.body;
    
    const appraisal = await Appraisal.findOneAndUpdate(
      { 
        _id: req.params.id,
        manager: req.user._id,
        status: 'submitted'
      },
      { 
        kras: kras.map(kra => ({
          name: kra.name,
          kpis: kra.kpis,
          managerRating: kra.managerRating
        })),
        managerFeedback,
        actionPlan,
        overallRating,
        status: 'reviewed',
        reviewedAt: new Date()
      },
      { new: true }
    );
    
    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal not found or already reviewed' });
    }
    
    res.status(200).json(appraisal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};