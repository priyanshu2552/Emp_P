// In your manager controller (appraisals.js)
const Appraisal = require('../../models/Appraisal');

// Get appraisals to review - CORRECTED
exports.getAppraisalsToReview = async (req, res) => {
  try {
    const appraisals = await Appraisal.find({ manager: req.user._id })
      .populate('employee', 'name email employeeId department')
      .sort({ submittedAt: -1 }); // Newest first
    
    res.status(200).json(appraisals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit manager evaluation - CORRECTED
exports.submitManagerEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { kras, managerFeedback, actionPlan, overallRating } = req.body;
    
    const appraisal = await Appraisal.findOneAndUpdate(
      { 
        _id: id,
        manager: req.user._id,
        status: 'submitted' // Only allow review of submitted appraisals
      },
      { 
        kras: kras.map(kra => ({
          name: kra.name,
          kpis: kra.kpis.map(kpi => ({
            name: kpi.name,
            target: kpi.target,
            managerRating: kpi.managerRating
          })),
          managerRating: kra.managerRating
        })),
        managerFeedback,
        actionPlan,
        overallRating,
        status: 'reviewed',
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('employee', 'name email'); // Populate employee data
    
    if (!appraisal) {
      return res.status(404).json({ 
        message: 'Appraisal not found or already reviewed' 
      });
    }
    
    res.status(200).json(appraisal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get team appraisal overview - CORRECTED
exports.getTeamOverview = async (req, res) => {
  try {
    const { period, year } = req.query;
    const filter = { manager: req.user._id };
    
    if (period) filter.period = period;
    if (year) filter.year = year;
    
    const appraisals = await Appraisal.find(filter)
      .populate('employee', 'name department') // Fixed field name
      .select('period year status overallRating employee');
    
    res.status(200).json(appraisals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};