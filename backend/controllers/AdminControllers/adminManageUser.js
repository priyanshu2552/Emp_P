const User = require('../../models/User');

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

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = new User({ name, email, password, role, contact, address, manager });
    await newUser.save();

    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
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
