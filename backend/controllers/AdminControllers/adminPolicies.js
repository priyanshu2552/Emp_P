const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const Policy = require('../../models/Policy');

// Initialize GridFS
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('policies'); // collection name
});

// Helper function to delete file from GridFS
const deleteFile = (fileId) => {
  return new Promise((resolve, reject) => {
    gfs.remove({ _id: fileId, root: 'policies' }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

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
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF file is required' });
    }

    const { title, description } = req.body;

    const newPolicy = new Policy({
      title,
      description,
      fileId: req.file.id, // Store the GridFS file ID
      contentType: req.file.contentType,
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
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    // If new file is uploaded
    if (req.file) {
      // Delete the old file from GridFS
      if (policy.fileId) {
        await deleteFile(policy.fileId);
      }

      // Update with new file details
      policy.fileId = req.file.id;
      policy.contentType = req.file.contentType;
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

    // Delete the associated file from GridFS
    if (policy.fileId) {
      await deleteFile(policy.fileId);
    }

    await Policy.findByIdAndDelete(id);
    res.json({ success: true, message: 'Policy deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting policy' });
  }
};

// New endpoint to serve files
exports.getPolicyFile = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy || !policy.fileId) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const fileId = policy.fileId;
    gfs.files.findOne({ _id: fileId }, (err, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({ success: false, message: 'File not found' });
      }

      // Check if file is PDF
      if (file.contentType === 'application/pdf') {
        // Create read stream
        const readstream = gfs.createReadStream({ _id: fileId });
        // Set the proper content type
        res.set('Content-Type', file.contentType);
        // Set filename for download
        res.set('Content-Disposition', `attachment; filename="${policy.title}.pdf"`);
        // Pipe the file to response
        readstream.pipe(res);
      } else {
        res.status(404).json({ success: false, message: 'Not a PDF file' });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving file' });
  }
};