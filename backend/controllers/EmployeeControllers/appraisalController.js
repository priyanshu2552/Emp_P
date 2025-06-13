const Appraisal = require('../../models/Appraisal');
const User = require('../../models/User');

// Get all appraisals for employee
exports.getEmployeeAppraisals = async (req, res) => {
  try {
    const appraisals = await Appraisal.find({ employee: req.user._id })
      .sort({ year: -1, period: 1 })
      .populate('manager', 'name email');
    
    const periodOptions = await getAvailablePeriods(req.user._id);
    
    res.status(200).json({ appraisals, periodOptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current appraisal
exports.getCurrentAppraisal = async (req, res) => {
  try {
    const { period, year } = req.query;
    const filter = { employee: req.user._id };
    
    if (period) filter.period = period;
    if (year) filter.year = year;
    
    const appraisal = await Appraisal.findOne(filter)
      .populate('manager', 'name email');
    
    if (!appraisal) {
      return res.status(404).json({ 
        message: 'No appraisal found',
        periodOptions: await getAvailablePeriods(req.user._id)
      });
    }
    
    res.status(200).json(appraisal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create/update self-evaluation
exports.updateSelfEvaluation = async (req, res) => {
  try {
    const { period, year, kras, additionalComments, careerGoals } = req.body;
    
    let appraisal = await Appraisal.findOne({
      employee: req.user._id,
      period,
      year,
      status: 'draft'
    });
    
    if (!appraisal) {
      const employee = await User.findById(req.user._id);
      if (!employee.manager) {
        return res.status(400).json({ message: 'No manager assigned' });
      }
      
      appraisal = new Appraisal({
        employee: req.user._id,
        manager: employee.manager,
        period,
        year,
        status: 'draft'
      });
    }
    
    // Update KRAs
    if (kras) {
      appraisal.kras = kras.map(kra => ({
        name: kra.name,
        kpis: kra.kpis,
        selfRating: kra.selfRating,
        achievements: kra.achievements,
        areasToImprove: kra.areasToImprove
      }));
    }
    
    if (additionalComments) appraisal.additionalComments = additionalComments;
    if (careerGoals) appraisal.careerGoals = careerGoals;
    
    await appraisal.save();
    res.status(200).json(appraisal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit appraisal
exports.submitAppraisal = async (req, res) => {
  try {
    const appraisal = await Appraisal.findOneAndUpdate(
      {
        employee: req.user._id,
        period: req.body.period,
        year: req.body.year,
        status: 'draft'
      },
      { 
        status: 'submitted',
        submittedAt: new Date()
      },
      { new: true }
    ).populate('manager', 'name email');
    
    if (!appraisal) {
      return res.status(404).json({ message: 'No draft appraisal found to submit' });
    }
    
    res.status(200).json(appraisal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get available periods
async function getAvailablePeriods(employeeId) {
  const currentYear = new Date().getFullYear();
  const periods = ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'];
  
  const existingAppraisals = await Appraisal.find({
    employee: employeeId,
    year: currentYear
  }).select('period');
  
  return periods.filter(p => !existingAppraisals.some(a => a.period === p));
}