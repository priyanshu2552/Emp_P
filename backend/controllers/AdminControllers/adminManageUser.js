const User = require('../../models/User');
const LeaveAllocation = require('../../models/LeaveAllocation'); // Add this import
const bcrypt = require('bcryptjs');

// Get all users with optional role filter
exports.getUsers = async (req, res) => {
  try {
    let role = req.query.role;
    const query = {};
    
    // Handle multiple roles (comma-separated)
    if (role) {
      if (role.includes(',')) {
        query.role = { $in: role.split(',') };
      } else {
        query.role = role;
      }
    }

    const users = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// Add a new employee
exports.addUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      contact,
      address,
      manager,
      Department,
      EmployeeId
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !Department || !EmployeeId) {
      return res.status(400).json({
        message: 'Name, email, password, Department and Employee ID are required'
      });
    }

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with explicit null for empty manager
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      contact: contact || null,
      address: address || null,
      manager: manager || null,
      Department,
      EmployeeId
    });
    await newUser.save();
   
    if (!newUser._id) {
      console.error('User ID missing — cannot create leave allocation.');
      return res.status(500).json({
        message: 'User ID missing during leave allocation.'
      });
    }
    console.log(await LeaveAllocation.find({ user: null }));
    try {
      console.log('newUser._id before LeaveAllocation:', newUser._id);
      const leaveAllocation = new LeaveAllocation({
        userId: newUser._id,
        year: new Date().getFullYear()
      });
      await leaveAllocation.save();
    } catch (allocErr) {
      console.error('Leave allocation error:', allocErr.message);
      return res.status(500).json({
        message: 'Leave allocation error',
        error: allocErr.message
      });
    }

    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;
    res.status(201).json(userWithoutPassword);

  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({
      message: 'Error creating user',
      error: err.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // First delete the user's leave allocations
    await LeaveAllocation.deleteMany({ user: userId });

    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};