import User from '../models/User.js';
import Reimbursement from '../models/Reimbursement.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
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
      .populate('employeeId', 'name email')
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(reimbursements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};