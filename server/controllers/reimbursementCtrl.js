import Reimbursement from '../models/Reimbursement.js';
import User from '../models/User.js';
import { sendStatusUpdateEmail } from '../utils/emailService.js';

export const createReimbursement = async (req, res) => {
  try {
    const { amount, description, category, receipt, managerEmail } = req.body;
    const manager = await User.findOne({ email: managerEmail, role: 'Manager' });
    
    if (!manager) {
      const reimbursement = await Reimbursement.create({
        employeeId: req.user._id,
        amount,
        description,
        category,
        receipt,
        status: 'Rejected',
        managerRemarks: 'Unknown manager email provided'
      });
      return res.status(201).json(reimbursement);
    }
    
    const reimbursement = await Reimbursement.create({
      employeeId: req.user._id,
      managerId: manager._id,
      amount,
      description,
      category,
      receipt
    });

    await sendStatusUpdateEmail(manager.email, reimbursement, 'Submitted for Review');
    res.status(201).json(reimbursement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReimbursements = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'Employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'Manager') {
      if (req.query.pending === 'true') {
        query = { managerId: req.user._id, status: 'Pending - Manager' };
      } else {
        query.managerId = req.user._id;
      }
    } else if (req.user.role === 'Finance') {
      query.status = 'Approved - Finance';
    } else if (req.user.role === 'Admin') {
      // Admin sees all
    }

    const reimbursements = await Reimbursement.find(query)
      .populate('employeeId', 'name email')
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(reimbursements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReimbursementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    
    const reimbursement = await Reimbursement.findById(id).populate('employeeId');
    if (!reimbursement) return res.status(404).json({ message: 'Reimbursement not found' });

    if (req.user.role === 'Manager' && reimbursement.status === 'Pending - Manager') {
      reimbursement.status = status === 'approve' ? 'Approved - Finance' : 'Rejected';
      reimbursement.managerRemarks = remarks;
      reimbursement.approvedByManager = status === 'approve' ? new Date() : null;
    } else if (req.user.role === 'Finance' && reimbursement.status === 'Approved - Finance') {
      reimbursement.status = status === 'approve' ? 'Completed' : 'Rejected';
      reimbursement.financeRemarks = remarks;
      reimbursement.approvedByFinance = status === 'approve' ? new Date() : null;
    } else {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    await reimbursement.save();
    await sendStatusUpdateEmail(reimbursement.employeeId.email, reimbursement, reimbursement.status, remarks);

    res.json(reimbursement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};