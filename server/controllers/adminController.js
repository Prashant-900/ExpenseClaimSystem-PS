import User from '../models/User.js';
import Reimbursement from '../models/Reimbursement.js';

const getProfileImageUrl = async (userId) => {
  try {
    const { Client } = await import('minio');
    const minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });
    
    const objectPath = `profiles/${userId}/profile.jpg`;
    
    try {
      await minioClient.statObject(process.env.MINIO_BUCKET, objectPath);
      return `http://localhost:5000/api/images/${objectPath}`;
    } catch (error) {
      return null;
    }
  } catch (error) {
    return null;
  }
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

export const getSystemLogs = async (req, res) => {
  try {
    const reimbursements = await Reimbursement.find()
      .populate('studentId', 'name email')
      .populate('facultySubmitterId', 'name email')
      .populate('facultyId', 'name email')
      .populate('auditId', 'name email')
      .sort({ createdAt: -1 });
    
    // Add profile images for populated users
    for (const reimbursement of reimbursements) {
      if (reimbursement.studentId) {
        reimbursement.studentId.profileImage = await getProfileImageUrl(reimbursement.studentId._id);
      }
      if (reimbursement.facultySubmitterId) {
        reimbursement.facultySubmitterId.profileImage = await getProfileImageUrl(reimbursement.facultySubmitterId._id);
      }
      if (reimbursement.facultyId) {
        reimbursement.facultyId.profileImage = await getProfileImageUrl(reimbursement.facultyId._id);
      }
      if (reimbursement.auditId) {
        reimbursement.auditId.profileImage = await getProfileImageUrl(reimbursement.auditId._id);
      }
    }
    
    res.json(reimbursements);
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