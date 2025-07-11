const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// Universal Login Handler
const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Please provide email, password, and role.' });
  }

  try {
    const user = await User.findOne({ email, role }).select('+password');

    if (!user) return res.status(404).json({ message: `${role} not found` });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = generateToken(user._id, user.role);

    // Convert binary image data to base64 if exists
    let profileImage = null;
    if (user.profileImage && user.profileImage.data) {
      profileImage = `data:${user.profileImage.contentType};base64,${user.profileImage.data.toString('base64')}`;
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage // Include the profile image in the response
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = { login };
