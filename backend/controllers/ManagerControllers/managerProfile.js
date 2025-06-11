const User = require('../../models/User');
const Appraisal = require('../../models/Appraisal'); // assuming the model name is Appraisal
const sharp = require('sharp'); 
// GET manager profile + count of employees + pending appraisals
exports.getManagerProfile = async (req, res) => {
    try {
        const managerId = req.user._id;

        // Get manager info
        const manager = await User.findById(managerId).select('-password');

        if (!manager || manager.role !== 'manager') {
            return res.status(404).json({ message: 'Manager not found' });
        }

        // Get employees under this manager
        const employees = await User.find({ manager: managerId });

        const employeeCount = employees.length;

        // Count appraisals submitted to this manager
        const pendingAppraisals = await Appraisal.countDocuments({
            managerId,
            status: 'submitted',
        });

        res.status(200).json({
            manager,
            employeeCount,
            totalPendingAppraisals: pendingAppraisals,
        });
        console.log({
            manager,
            employeeCount,
            totalPendingAppraisals: pendingAppraisals,
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// GET list of all employees under a manager
exports.getEmployeesUnderManager = async (req, res) => {
    try {
        const managerId = req.user._id;

        const employees = await User.find({ manager: managerId }).select('-password');


        res.status(200).json({ employees });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees', error });
    }
};

// GET details of one employee under this manager
exports.getEmployeeDetails = async (req, res) => {
    try {
        const managerId = req.user._id;
        const employeeId = req.params.id;

        const employee = await User.findOne({
            _id: employeeId,
            manager: managerId,
        }).select('-password');


        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ employee });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee details', error });
    }
};
exports.updateManagerProfile = async (req, res) => {
    try {
        const managerId = req.user._id;
        const { name, contact, address } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Name cannot be empty' });
        }

        const updatedManager = await User.findByIdAndUpdate(
            managerId,
            { name, contact, address },
            { new: true, runValidators: true, select: '-password' }
        );

        if (!updatedManager) {
            return res.status(404).json({ message: 'Manager not found' });
        }

        res.status(200).json({ manager: updatedManager });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No image file provided'
      });
    }

    const userId = req.user._id;

    // Process image with sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(500, 500)
      .jpeg({ quality: 80 })
      .toBuffer();

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        profileImage: {
          data: processedImage,
          contentType: 'image/jpeg'
        }
      },
      { new: true }
    ).select('-password');

    // Return the updated user data
    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      profile: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading profile image',
      error: error.message
    });
  }
};

exports.getProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('profileImage');

    if (!user?.profileImage?.data) {
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', user.profileImage.contentType);
    res.send(user.profileImage.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile image'
    });
  }
};