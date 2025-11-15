import User from '../models/User.js';
import SchoolAdmin from '../models/SchoolAdmin.js';
import ExpenseReport from '../models/ExpenseReport.js';
import { attachProfileImagesToUsers, attachProfileImagesToReports } from '../utils/imageUtils.js';
import { ErrorTypes } from '../utils/appError.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const usersWithImages = await attachProfileImagesToUsers(users);
    res.json(usersWithImages);
  } catch (error) {
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) {
      const error = ErrorTypes.USER_NOT_FOUND();
      return res.status(error.statusCode).json({ message: error.message });
    }
    
    res.json(user);
  } catch (error) {
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (id === req.user._id.toString()) {
      const error = ErrorTypes.INVALID_STATE('Cannot delete your own account');
      return res.status(error.statusCode).json({ message: error.message });
    }
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      const error = ErrorTypes.USER_NOT_FOUND();
      return res.status(error.statusCode).json({ message: error.message });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};

export const getSystemLogs = async (req, res) => {
  try {
    const expenseReports = await ExpenseReport.find()
      .populate('submitterId', 'name email')
      .sort({ createdAt: -1 });
    
    const reportsWithImages = await attachProfileImagesToReports(expenseReports);
    res.json(reportsWithImages);
  } catch (error) {
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};

// School Administration Management

export const getSchoolAdmins = async (req, res) => {
  try {
    const schoolAdmins = await SchoolAdmin.find()
      .populate('schoolChairId', 'name email department')
      .populate('deanSRICId', 'name email')
      .populate('directorId', 'name email');
    res.json(schoolAdmins);
  } catch (error) {
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};

export const assignSchoolChair = async (req, res) => {
  try {
    const { school, userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'Faculty') {
      const error = ErrorTypes.VALIDATION_ERROR('Selected user must be a Faculty member');
      return res.status(error.statusCode).json({ message: error.message });
    }
    
    if (user.department !== school) {
      const error = ErrorTypes.VALIDATION_ERROR('School chair must be from the same school');
      return res.status(error.statusCode).json({ message: error.message });
    }
    
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
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};

export const assignDeanSRIC = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'Faculty') {
      const error = ErrorTypes.VALIDATION_ERROR('Dean SRIC must be a Faculty member');
      return res.status(error.statusCode).json({ message: error.message });
    }
    
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
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};

export const assignDirector = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'Faculty') {
      const error = ErrorTypes.VALIDATION_ERROR('Director must be a Faculty member');
      return res.status(error.statusCode).json({ message: error.message });
    }
    
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
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};