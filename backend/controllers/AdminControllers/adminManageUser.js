const User = require('../../models/User');
const bcrypt = require('bcryptjs');
// Get all users with optional role filter
exports.getUsers = async (req, res) => {
  try {
    const role = req.query.role;
    const query = role ? { role } : {};

    const users = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// Add a new employee
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role = 'employee', contact, address, manager } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
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
      manager: manager || null // This ensures empty string becomes null
    });

    await newUser.save();

    // Return user without sensitive data
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

    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};
