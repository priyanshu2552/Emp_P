const Appraisal = require('../../models/Appraisal');

// Get all appraisals for current employee
exports.getMyAppraisals = async (req, res) => {
  try {
    const appraisals = await Appraisal.find({ employee: req.user._id })
      .populate({
        path: 'manager',
        select: 'name email EmployeeId'
      })
      .sort({ year: -1, period: 1 });

    // Transform data for better frontend display
    const transformedAppraisals = appraisals.map(appraisal => ({
      _id: appraisal._id,
      period: appraisal.period,
      year: appraisal.year,
      status: appraisal.status,
      createdAt: appraisal.createdAt,
      manager: appraisal.manager,
      employeeSubmission: appraisal.employeeSubmission,
      managerReview: appraisal.managerReview
    }));

    res.json(transformedAppraisals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single appraisal form
exports.getAppraisalForm = async (req, res) => {
  try {
    const appraisal = await Appraisal.findOne({
      _id: req.params.id,
      employee: req.user._id
    }).populate({
      path: 'manager',
      select: 'name email EmployeeId'
    });

    if (!appraisal) {
      return res.status(404).json({ error: 'Appraisal not found' });
    }

    // Prevent access if not sent to employee
    if (appraisal.status !== 'sent-to-employee' && 
        appraisal.status !== 'submitted-by-employee' && 
        appraisal.status !== 'reviewed-by-manager' && 
        appraisal.status !== 'rejected') {
      return res.status(403).json({ 
        error: 'This appraisal is not available for submission' 
      });
    }

    res.json(appraisal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit appraisal form
exports.submitAppraisalForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { workItems, goals, keyResults, additionalComments, selfRating, finalComments } = req.body;

    const appraisal = await Appraisal.findOne({
      _id: id,
      employee: req.user._id,
      status: 'sent-to-employee'
    });

    if (!appraisal) {
      return res.status(404).json({ 
        error: 'Appraisal not found or already submitted' 
      });
    }

    // Validate required fields
    if (!workItems || !goals || !keyResults || !selfRating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update appraisal with employee's submission
    appraisal.workItems = workItems;
    appraisal.goals = goals;
    appraisal.keyResults = keyResults;
    appraisal.additionalComments = additionalComments;
    appraisal.employeeSubmission = {
      submittedAt: new Date(),
      selfRating,
      finalComments
    };
    appraisal.status = 'submitted-by-employee';

    await appraisal.save();

    // TODO: Send notification to manager

    res.json({
      message: 'Appraisal submitted successfully',
      appraisal
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View reviewed appraisal
exports.getReviewedAppraisal = async (req, res) => {
  try {
    const appraisal = await Appraisal.findOne({
      _id: req.params.id,
      employee: req.user._id,
      status: { $in: ['reviewed-by-manager', 'rejected'] }
    }).populate({
      path: 'manager',
      select: 'name email EmployeeId'
    });

    if (!appraisal) {
      return res.status(404).json({ 
        error: 'Appraisal not found or not yet reviewed' 
      });
    }

    res.json(appraisal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};