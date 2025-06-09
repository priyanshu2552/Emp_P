const Policy = require('../../models/Policy');
const PolicyAck = require('../../models/PolicyAck');
const { GridFSBucket, ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const pdf = require('pdf-parse');

exports.getAllPolicies = async (req, res) => {
  try {
    const userId = req.user._id;

    const policies = await Policy.find().sort({ createdAt: -1 });

    const acknowledgements = await PolicyAck.find({ userId });
    const ackMap = {};
    acknowledgements.forEach((ack) => {
      ackMap[ack.policyId] = ack;
    });

    const response = policies.map((policy) => ({
      ...policy.toObject(),
      isRead: ackMap[policy._id]?.isRead || false,
      readAt: ackMap[policy._id]?.readAt || null,
    }));

    res.status(200).json({ success: true, policies: response });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch policies' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { policyId } = req.body;
    const userId = req.user._id;

    let ack = await PolicyAck.findOne({ policyId, userId });
    if (!ack) {
      ack = new PolicyAck({ policyId, userId, isRead: true, readAt: new Date() });
    } else {
      ack.isRead = true;
      ack.readAt = new Date();
    }

    await ack.save();
    res.status(200).json({ success: true, message: 'Policy marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
};

exports.downloadPolicy = async (req, res) => {
    try {
        const policyId = req.params.id;
        
        // Verify the policy exists
        const policy = await Policy.findById(policyId);
        if (!policy) {
            return res.status(404).json({ 
                success: false, 
                message: 'Policy not found' 
            });
        }

        if (!policy.fileId) {
            return res.status(404).json({ 
                success: false, 
                message: 'No file associated with this policy' 
            });
        }

        // Get the database connection from mongoose
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: 'policies' });

        // Verify the file exists in GridFS
        const files = await bucket.find({ _id: new ObjectId(policy.fileId) }).toArray();
        if (files.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'File not found in database' 
            });
        }

        // Set proper headers for file download
        res.set({
            'Content-Type': files[0].contentType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(policy.title)}.pdf"`,
            'Content-Length': files[0].length,
            'Cache-Control': 'no-cache'
        });
        
        // Stream the file
        const downloadStream = bucket.openDownloadStream(new ObjectId(policy.fileId));
        
        downloadStream.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({ 
                    success: false, 
                    message: 'Error streaming file' 
                });
            }
        });
        
        downloadStream.pipe(res);
        
    } catch (err) {
        console.error('Download error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error downloading file',
            error: err.message 
        });
    }
};
exports.getPolicyText = async (req, res) => {
  try {
    const policyId = req.params.id;
    const policy = await Policy.findById(policyId);
    
    if (!policy) {
      return res.status(404).json({ 
        success: false, 
        message: 'Policy not found' 
      });
    }

    if (!policy.extractedText) {
      return res.status(404).json({ 
        success: false, 
        message: 'No text content available for this policy' 
      });
    }

    res.status(200).json({ 
      success: true, 
      text: policy.extractedText 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch policy text' 
    });
  }
};