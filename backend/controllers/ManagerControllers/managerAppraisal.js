const Appraisal = require('../../models/Appraisal');
const User = require('../../models/User');

// Helper function to check if manager is authorized for employee
const isManagerOfEmployee = async (managerId, employeeId) => {
  const employee = await User.findById(employeeId);
  return employee && employee.manager && employee.manager.equals(managerId);
};

// Get all employees under this manager with their details
exports.getMyTeam = async (req, res) => {
  try {
    const employees = await User.find({ manager: req.user._id })
      .select('name email EmployeeId contact role Department createdAt')
      .sort({ name: 1 });

    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send appraisal form to employee (quarterly/yearly)
exports.sendAppraisalForm = async (req, res) => {
  try {
    const { employeeId, period, year } = req.body;

    // Validate period
    if (!['Q1', 'Q2', 'Q3', 'Q4', 'Annual'].includes(period)) {
      return res.status(400).json({ error: 'Invalid period' });
    }

    // Check if manager is authorized for this employee
    if (!await isManagerOfEmployee(req.user._id, employeeId)) {
      return res.status(403).json({ error: 'Not authorized for this employee' });
    }

    // Check if appraisal already exists for this period
    const existingAppraisal = await Appraisal.findOne({
      employee: employeeId,
      period,
      year
    });

    if (existingAppraisal) {
      return res.status(400).json({ 
        error: `Appraisal already ${existingAppraisal.status === 'draft' ? 'created' : 'sent'} for this period`,
        existingAppraisal
      });
    }

    // Get employee details
    const employee = await User.findById(employeeId)
      .select('name email EmployeeId contact role Department');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Create new appraisal
    const appraisal = new Appraisal({
      manager: req.user._id,
      employee: employeeId,
      period,
      year,
      status: 'sent-to-employee'
    });

    await appraisal.save();

    // TODO: Send notification to employee

    res.status(201).json({
      message: `Appraisal form sent successfully for ${period} ${year}`,
      appraisal
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all appraisals for manager's team
exports.getTeamAppraisals = async (req, res) => {
  try {
    const appraisals = await Appraisal.find({ manager: req.user._id })
      .populate({
        path: 'employee',
        select: 'name email EmployeeId contact role Department'
      })
      .sort({ year: -1, period: 1, createdAt: -1 });

    res.json(appraisals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Review employee submission (approve/reject)
exports.reviewAppraisal = async (req, res) => {
  try {
    const { id } = req.params;
    const { overallRating, feedback, acknowledgement, actionItems, status } = req.body;

    if (!['reviewed-by-manager', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appraisal = await Appraisal.findOne({
      _id: id,
      manager: req.user._id,
      status: 'submitted-by-employee'
    });

    if (!appraisal) {
      return res.status(404).json({ 
        error: 'Appraisal not found or not in submitted state' 
      });
    }

    // Update appraisal with manager's review
    appraisal.managerReview = {
      reviewedAt: new Date(),
      overallRating,
      feedback,
      acknowledgement,
      actionItems: actionItems || []
    };
    appraisal.status = status;

    await appraisal.save();

    // TODO: Send notification to employee about review

    res.json({
      message: `Appraisal ${status === 'reviewed-by-manager' ? 'approved' : 'rejected'}`,
      appraisal
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single appraisal details
exports.getAppraisalDetails = async (req, res) => {
  try {
    const appraisal = await Appraisal.findOne({
      _id: req.params.id,
      manager: req.user._id
    }).populate({
      path: 'employee',
      select: 'name email EmployeeId contact role Department'
    });

    if (!appraisal) {
      return res.status(404).json({ error: 'Appraisal not found' });
    }

    res.json(appraisal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};