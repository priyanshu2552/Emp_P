const Policy = require('../../models/Policy');
const fs = require('fs');
const path = require('path');

exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find().populate('createdBy', 'name email');
    res.json({ success: true, policies });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addPolicy = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'PDF file is required' });

    const { title, description } = req.body;

    const newPolicy = new Policy({
      title,
      description,
      fileUrl: `/uploads/policies/${req.file.filename}`,
      createdBy: req.user._id,
    });

    await newPolicy.save();
    res.status(201).json({ success: true, policy: newPolicy });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error uploading policy' });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const policy = await Policy.findById(id);
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' });

    if (req.file) {
      const oldPath = path.join(__dirname, '../../', policy.fileUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      policy.fileUrl = `/uploads/policies/${req.file.filename}`;
    }

    policy.title = title || policy.title;
    policy.description = description || policy.description;
    policy.version += 1;
    policy.updatedAt = Date.now();

    await policy.save();
    res.json({ success: true, policy });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating policy' });
  }
};
exports.deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    // Delete the associated PDF file
    const filePath = path.join(__dirname, '../../', policy.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Policy.findByIdAndDelete(id);
    res.json({ success: true, message: 'Policy deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting policy' });
  }
};

