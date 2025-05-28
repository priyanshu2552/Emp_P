const Policy = require('../../models/Policy');
const PolicyAck = require('../../models/PolicyAck');

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
