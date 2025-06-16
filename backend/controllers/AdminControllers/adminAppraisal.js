const Appraisal = require('../../models/Appraisal');
const User = require('../../models/User');

// Get all appraisal details with populated employee and manager info
exports.getAllAppraisalDetails = async (req, res) => {
  try {
    const appraisals = await Appraisal.find()
      .populate({
        path: 'employee',
        select: 'name email EmployeeId Department role contact'
      })
      .populate({
        path: 'manager',
        select: 'name email EmployeeId Department role'
      })
      .sort({ year: -1, period: 1, createdAt: -1 });

    // Transform the data for better frontend consumption
    const transformedAppraisals = appraisals.map(appraisal => ({
      _id: appraisal._id,
      period: appraisal.period,
      year: appraisal.year,
      status: appraisal.status,
      createdAt: appraisal.createdAt,
      updatedAt: appraisal.updatedAt,
      
      // Employee Details
      employee: {
        _id: appraisal.employee._id,
        name: appraisal.employee.name,
        email: appraisal.employee.email,
        employeeId: appraisal.employee.EmployeeId,
        department: appraisal.employee.Department,
        role: appraisal.employee.role,
        contact: appraisal.employee.contact
      },
      
      // Manager Details
      manager: {
        _id: appraisal.manager._id,
        name: appraisal.manager.name,
        email: appraisal.manager.email,
        employeeId: appraisal.manager.EmployeeId,
        department: appraisal.manager.Department,
        role: appraisal.manager.role
      },
      
      // Work Items
      workItems: appraisal.workItems,
      
      // Goals
      goals: appraisal.goals,
      
      // Key Results
      keyResults: appraisal.keyResults,
      
      // Additional Comments
      additionalComments: appraisal.additionalComments,
      
      // Employee Submission
      employeeSubmission: appraisal.employeeSubmission,
      
      // Manager Review
      managerReview: appraisal.managerReview
    }));

    res.json(transformedAppraisals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single appraisal with full details
exports.getAppraisalDetails = async (req, res) => {
  try {
    const appraisal = await Appraisal.findById(req.params.id)
      .populate({
        path: 'employee',
        select: 'name email EmployeeId Department role contact createdAt'
      })
      .populate({
        path: 'manager',
        select: 'name email EmployeeId Department role'
      });

    if (!appraisal) {
      return res.status(404).json({ error: 'Appraisal not found' });
    }

    const transformedAppraisal = {
      _id: appraisal._id,
      period: appraisal.period,
      year: appraisal.year,
      status: appraisal.status,
      createdAt: appraisal.createdAt,
      updatedAt: appraisal.updatedAt,
      
      // Employee Details
      employee: {
        _id: appraisal.employee._id,
        name: appraisal.employee.name,
        email: appraisal.employee.email,
        employeeId: appraisal.employee.EmployeeId,
        department: appraisal.employee.Department,
        role: appraisal.employee.role,
        contact: appraisal.employee.contact,
        joinDate: appraisal.employee.createdAt
      },
      
      // Manager Details
      manager: {
        _id: appraisal.manager._id,
        name: appraisal.manager.name,
        email: appraisal.manager.email,
        employeeId: appraisal.manager.EmployeeId,
        department: appraisal.manager.Department,
        role: appraisal.manager.role
      },
      
      // Work Section
      workItems: appraisal.workItems,
      
      // Goals Section
      goals: appraisal.goals,
      
      // Key Results
      keyResults: appraisal.keyResults,
      
      // Additional Comments
      additionalComments: appraisal.additionalComments,
      
      // Employee Submission
      employeeSubmission: appraisal.employeeSubmission,
      
      // Manager Review
      managerReview: appraisal.managerReview
    };

    res.json(transformedAppraisal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};