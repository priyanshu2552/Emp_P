const Appraisal = require('../../models/Appraisal');
const User = require('../../models/User');

// Get all appraisals
exports.getAllAppraisals = async (req, res) => {
  try {
    const { status, period, year } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (period) filter.period = period;
    if (year) filter.year = year;
    
    const appraisals = await Appraisal.find(filter)
      .populate('employee', 'name email EmployeeId Department')
      .populate('manager', 'name email');
    
    res.status(200).json(appraisals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get appraisal by employee
exports.getAppraisalsByEmployee = async (req, res) => {
  try {
    const appraisals = await Appraisal.find({ employee: req.params.employeeId })
      .populate('employee', 'name email EmployeeId Department')
      .populate('manager', 'name email');
    
    res.status(200).json(appraisals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create appraisal template
exports.createAppraisalTemplate = async (req, res) => {
  try {
    const { period, year, kras } = req.body;
    
    // Get all employees
    const employees = await User.find({ role: 'employee' });
    
    // Create appraisals for each employee
    const appraisals = await Promise.all(employees.map(async employee => {
      const manager = await User.findById(employee.manager);
      
      return new Appraisal({
        employee: employee._id,
        manager: manager ? manager._id : null,
        period,
        year,
        kras,
        status: 'draft'
      }).save();
    }));
    
    res.status(201).json(appraisals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};