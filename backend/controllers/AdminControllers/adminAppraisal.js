const Appraisal = require('../../models/Appraisal');
const User = require('../../models/User');

// Create appraisal cycle
exports.createAppraisalCycle = async (req, res) => {
  try {
    const { period, year, employees } = req.body;
    
    // Validate period
    const validPeriods = ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ message: 'Invalid appraisal period' });
    }

    // Create appraisals for selected employees
    const appraisals = await Promise.all(employees.map(async employeeId => {
      const employee = await User.findById(employeeId);
      if (!employee) throw new Error(`Employee ${employeeId} not found`);
      
      return new Appraisal({
        employee: employee._id,
        manager: employee.manager,
        period,
        year,
        status: 'draft'
      }).save();
    }));

    res.status(201).json(appraisals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all appraisals with filters
exports.getAllAppraisals = async (req, res) => {
  try {
    const { status, period, year, department } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (period) filter.period = period;
    if (year) filter.year = year;
    
    // Add department filter if provided
    if (department) {
      const employees = await User.find({ Department: department }).select('_id');
      filter.employee = { $in: employees.map(e => e._id) };
    }
    
    const appraisals = await Appraisal.find(filter)
      .populate('employee', 'name email EmployeeId Department')
      .populate('manager', 'name email')
      .sort({ year: -1, period: 1 });
    
    res.status(200).json(appraisals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get appraisal statistics
exports.getAppraisalStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const stats = await Appraisal.aggregate([
      { $match: { year: currentYear } },
      { $group: {
        _id: { period: "$period", status: "$status" },
        count: { $sum: 1 },
        avgRating: { $avg: "$overallRating" }
      }},
      { $group: {
        _id: "$_id.period",
        statuses: { $push: { status: "$_id.status", count: "$count" } },
        avgRating: { $avg: "$avgRating" }
      }}
    ]);
    
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};