import User from '../models/User.js';
import ExpenseReport from '../models/ExpenseReport.js';

const getProfileImageUrl = (userId) => {
  // Return direct public S3 URL (bucket is public)
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/profiles/${userId}/profile.jpg`;
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    // Add profile images
    for (const user of users) {
      user.profileImage = await getProfileImageUrl(user._id);
    }
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSystemLogs = async (req, res) => {
  try {
    const expenseReports = await ExpenseReport.find()
      .populate('submitterId', 'name email')
      .sort({ createdAt: -1 });
    
    // Add profile images for populated users
    for (const report of expenseReports) {
      if (report.submitterId) {
        report.submitterId.profileImage = await getProfileImageUrl(report.submitterId._id);
      }
    }
    
    res.json(expenseReports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// School Administration Management
import SchoolAdmin from '../models/SchoolAdmin.js';

export const getSchoolAdmins = async (req, res) => {
  try {
    const schoolAdmins = await SchoolAdmin.find()
      .populate('schoolChairId', 'name email department')
      .populate('deanSRICId', 'name email')
      .populate('directorId', 'name email');
    res.json(schoolAdmins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignSchoolChair = async (req, res) => {
  try {
    const { school, userId } = req.body;
    
    // Verify user is faculty from the same school
    const user = await User.findById(userId);
    if (!user || user.role !== 'Faculty') {
      return res.status(400).json({ message: 'Selected user must be a Faculty member' });
    }
    
    if (user.department !== school) {
      return res.status(400).json({ message: 'School chair must be from the same school' });
    }
    
    // Update or create school admin record
    const schoolAdmin = await SchoolAdmin.findOneAndUpdate(
      { school },
      { 
        schoolChairId: userId,
        schoolChairName: user.name
      },
      { upsert: true, new: true }
    );
    
    res.json(schoolAdmin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignDeanSRIC = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'Faculty') {
      return res.status(400).json({ message: 'Dean SRIC must be a Faculty member' });
    }
    
    // Dean SRIC is institute-wide, not school-specific
    // We'll store in a special "Institute" record
    const schoolAdmin = await SchoolAdmin.findOneAndUpdate(
      { school: 'Institute' },
      { 
        deanSRICId: userId,
        deanSRICName: user.name
      },
      { upsert: true, new: true }
    );
    
    res.json(schoolAdmin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignDirector = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'Faculty') {
      return res.status(400).json({ message: 'Director must be a Faculty member' });
    }
    
    // Director is institute-wide
    const schoolAdmin = await SchoolAdmin.findOneAndUpdate(
      { school: 'Institute' },
      { 
        directorId: userId,
        directorName: user.name
      },
      { upsert: true, new: true }
    );
    
    res.json(schoolAdmin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};