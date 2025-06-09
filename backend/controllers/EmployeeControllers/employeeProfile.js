const User=require('../../models/User');
const Leave=require('../../models/Leave')
const Policy=require('../../models/Policy')
const PolicyAck=require('../../models/PolicyAck')
const EmpProfile=require('../../models/EmployeeProfile')
const Appraisal=require('../../models/Appraisal')
const Expense=require('../../models/Expense')
const reviews=require('../../models/WeeklyReview')
const sharp = require('sharp'); 


// Get employee profile with manager details
exports.getEmployeeProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const profile = await User.findById(userId)
            .select('-password')
            .populate({
                path: 'manager',
                select: 'name email role contact profileImage'
            });

        if (!profile) {
            return res.status(404).json({ 
                success: false,
                message: 'Profile not found' 
            });
        }

        res.status(200).json({
            success: true,
            profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update employee profile
exports.updateEmployeeProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updates = req.body;

        // Remove restricted fields
        delete updates.role;
        delete updates.password;
        delete updates._id;

        // If updating manager, validate the manager exists and has correct role
        if (updates.manager) {
            const newManager = await User.findById(updates.manager);
            if (!newManager || !['admin', 'manager'].includes(newManager.role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected manager is invalid'
                });
            }
        }

        const updatedProfile = await User.findByIdAndUpdate(
            userId, 
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: updatedProfile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// Get list of potential managers (for dropdown selection)
exports.getManagersList = async (req, res) => {
    try {
        const userId = req.user._id;
        const { search = '' } = req.query;

        const managers = await User.find({
            _id: { $ne: userId }, // Exclude current user
            role: { $in: ['manager'] }, // Only admins and managers
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        })
        .select('_id name email role profileImage')
        .limit(20);

        res.status(200).json({
            success: true,
            managers
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching managers list',
            error: error.message
        });
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