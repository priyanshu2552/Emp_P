const Appraisal = require('../../models/Appraisal');
const User = require('../../models/User');

// Get current appraisal
exports.getCurrentAppraisal = async (req, res) => {
  try {
    const appraisal = await Appraisal.findOne({
      employee: req.user._id,
      status: { $in: ['draft', 'submitted', 'reviewed'] }
    }).populate('manager', 'name email');
    
    if (!appraisal) {
      return res.status(404).json({ message: 'No active appraisal found' });
    }
    
    res.status(200).json(appraisal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create or update self-evaluation
exports.updateSelfEvaluation = async (req, res) => {
  try {
    const { kras, additionalComments, careerGoals } = req.body;
    
    let appraisal = await Appraisal.findOne({
      employee: req.user._id,
      status: 'draft'
    });
    
    if (!appraisal) {
      // Create new appraisal if none exists
      const manager = await User.findOne({ 
        _id: req.user.manager || { $exists: false } 
      });
      
      if (!manager) {
        return res.status(400).json({ message: 'No manager assigned' });
      }
      
      appraisal = new Appraisal({
        employee: req.user._id,
        manager: manager._id,
        period: req.body.period || 'Q1',
        year: req.body.year || new Date().getFullYear(),
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

exports.submitAppraisal = async (req, res) => {
  try {
    const { kras, additionalComments, careerGoals, period, year } = req.body;
    const employeeId = req.user._id;

    // Validate all required fields
    if (!kras || !Array.isArray(kras)) {
      return res.status(400).json({ message: 'Invalid KRAs data' });
    }

    // Check if all KRAs are complete
    const incompleteKRA = kras.some(kra => 
      !kra.selfRating || 
      !kra.achievements || 
      !kra.areasToImprove ||
      kra.kpis.some(kpi => !kpi.selfRating)
    );

    if (incompleteKRA) {
      return res.status(400).json({ 
        message: 'Please complete all self-evaluations before submitting' 
      });
    }

    // Get employee's manager
    const employee = await User.findById(employeeId);
    if (!employee.manager) {
      return res.status(400).json({ 
        message: 'You must have an assigned manager to submit an appraisal' 
      });
    }

    // Create or update the appraisal
    const appraisal = await Appraisal.findOneAndUpdate(
      { employee: employeeId, status: 'draft' },
      {
        $set: {
          kras,
          additionalComments,
          careerGoals,
          period,
          year,
          manager: employee.manager, // Add manager ID from employee record
          status: 'submitted',
          submittedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );

    res.status(200).json(appraisal);
  } catch (error) {
    console.error('Appraisal submission error:', error);
    res.status(500).json({ message: error.message });
  }
};