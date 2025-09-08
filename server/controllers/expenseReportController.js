import ExpenseReport from '../models/ExpenseReport.js';
import User from '../models/User.js';
import { uploadToMinio } from '../middleware/fileUploadMiddleware.js';

export const createExpenseReport = async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      submitterId: req.user._id,
      submitterRole: req.user.role
    };
    
    // For student submissions, auto-assign faculty by department
    if (req.user.role === 'Student') {
      const faculty = await User.findOne({ 
        department: req.user.department, 
        role: 'Faculty' 
      });
      if (faculty) {
        reportData.facultyId = faculty._id;
        reportData.facultyName = faculty.name;
      }
    }
    
    const report = await ExpenseReport.create(reportData);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpenseReports = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'Student') {
      query.submitterId = req.user._id;
    } else if (req.user.role === 'Faculty') {
      // Check if it's pending or reviewed endpoint
      if (req.query.pending === 'true') {
        // Only student reports needing faculty approval
        query = { facultyId: req.user._id, status: 'Submitted' };
      } else if (req.query.reviewed === 'true') {
        // Only student reports already reviewed by faculty
        query = { facultyId: req.user._id, status: { $in: ['Faculty Approved', 'Audit Approved', 'Finance Approved', 'Rejected'] } };
      } else {
        // Default: only faculty's own reports
        query.submitterId = req.user._id;
      }
    } else if (req.user.role === 'Audit') {
      if (req.query.all === 'true') {
        // Audit-all endpoint: only processed reports (exclude pending)
        query.status = { $in: ['Audit Approved', 'Finance Approved', 'Rejected'] };
      } else {
        // Default audit endpoint: only pending reports
        query.status = 'Faculty Approved';
      }
    } else if (req.user.role === 'Finance') {
      // Finance sees all reports they can/have reviewed
      query.status = { $in: ['Audit Approved', 'Finance Approved', 'Rejected'] };
    }
    
    const reports = await ExpenseReport.find(query)
      .populate('submitterId', 'name email department role')
      .populate('facultyId', 'name email department')
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpenseReportById = async (req, res) => {
  try {
    const report = await ExpenseReport.findById(req.params.id)
      .populate('submitterId', 'name email department role')
      .populate('facultyId', 'name email department');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExpenseReport = async (req, res) => {
  try {
    const report = await ExpenseReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('facultyId', 'name email department');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitExpenseReport = async (req, res) => {
  try {
    const report = await ExpenseReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Determine next status based on submitter role
    if (req.user.role === 'Student') {
      report.status = 'Submitted'; // Goes to Faculty first
    } else if (req.user.role === 'Faculty') {
      report.status = 'Faculty Approved'; // Faculty reports go to Audit
    }
    
    report.submissionDate = new Date();
    
    await report.save();
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveExpenseReport = async (req, res) => {
  try {
    const { action, remarks } = req.body;
    const report = await ExpenseReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const currentDate = new Date();
    
    if (req.user.role === 'Faculty' && report.status === 'Submitted') {
      if (action === 'approve') {
        report.status = 'Faculty Approved';
        report.facultyApproval = { approved: true, date: currentDate, remarks };
      } else if (action === 'reject') {
        report.status = 'Rejected';
        report.facultyApproval = { approved: false, date: currentDate, remarks };
      } else if (action === 'sendback') {
        report.status = 'Draft';
        report.facultyApproval = { approved: null, date: currentDate, remarks, action: 'sendback' };
      }
    } else if (req.user.role === 'Audit' && report.status === 'Faculty Approved') {
      if (action === 'approve') {
        report.status = 'Audit Approved';
        report.auditApproval = { approved: true, date: currentDate, remarks };
      } else if (action === 'reject') {
        report.status = 'Rejected';
        report.auditApproval = { approved: false, date: currentDate, remarks };
      } else if (action === 'sendback') {
        report.status = 'Submitted';
        report.auditApproval = { approved: null, date: currentDate, remarks, action: 'sendback' };
      }
    } else if (req.user.role === 'Finance' && report.status === 'Audit Approved') {
      if (action === 'approve') {
        report.status = 'Finance Approved';
        report.financeApproval = { approved: true, date: currentDate, remarks };
      } else if (action === 'reject') {
        report.status = 'Rejected';
        report.financeApproval = { approved: false, date: currentDate, remarks };
      } else if (action === 'sendback') {
        report.status = 'Faculty Approved';
        report.financeApproval = { approved: null, date: currentDate, remarks, action: 'sendback' };
      }
    } else {
      return res.status(400).json({ message: 'Invalid approval action for current status' });
    }
    
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addExpenseItem = async (req, res) => {
  try {
    const report = await ExpenseReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    let receiptFileName = '';
    if (req.file) {
      receiptFileName = await uploadToMinio(req.file, req.user._id);
    }
    
    const newItem = {
      ...req.body,
      receipt: receiptFileName
    };
    
    report.items.push(newItem);
    
    // Recalculate totals
    report.totalAmount = report.items.reduce((sum, item) => sum + item.amount, 0);
    report.universityCardAmount = report.items
      .filter(item => item.paymentMethod === 'University Credit Card (P-Card)')
      .reduce((sum, item) => sum + item.amount, 0);
    report.personalAmount = report.items
      .filter(item => item.paymentMethod === 'Personal Funds (Reimbursement)')
      .reduce((sum, item) => sum + item.amount, 0);
    report.netReimbursement = report.personalAmount - (report.nonReimbursableAmount || 0);
    
    await report.save();
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExpenseItem = async (req, res) => {
  try {
    const report = await ExpenseReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const item = report.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    Object.assign(item, req.body);
    
    // Recalculate totals
    report.totalAmount = report.items.reduce((sum, item) => sum + item.amount, 0);
    report.universityCardAmount = report.items
      .filter(item => item.paymentMethod === 'University Credit Card (P-Card)')
      .reduce((sum, item) => sum + item.amount, 0);
    report.personalAmount = report.items
      .filter(item => item.paymentMethod === 'Personal Funds (Reimbursement)')
      .reduce((sum, item) => sum + item.amount, 0);
    report.netReimbursement = report.personalAmount - (report.nonReimbursableAmount || 0);
    
    await report.save();
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpenseItem = async (req, res) => {
  try {
    const report = await ExpenseReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    report.items.id(req.params.itemId).remove();
    
    // Recalculate totals
    report.totalAmount = report.items.reduce((sum, item) => sum + item.amount, 0);
    report.universityCardAmount = report.items
      .filter(item => item.paymentMethod === 'University Credit Card (P-Card)')
      .reduce((sum, item) => sum + item.amount, 0);
    report.personalAmount = report.items
      .filter(item => item.paymentMethod === 'Personal Funds (Reimbursement)')
      .reduce((sum, item) => sum + item.amount, 0);
    report.netReimbursement = report.personalAmount - (report.nonReimbursableAmount || 0);
    
    await report.save();
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpenseReport = async (req, res) => {
  try {
    console.log('Delete request for report ID:', req.params.id);
    console.log('User:', req.user?.email, req.user?.role);
    
    const report = await ExpenseReport.findById(req.params.id);
    
    if (!report) {
      console.log('Report not found');
      return res.status(404).json({ message: 'Report not found' });
    }
    
    console.log('Report status:', report.status);
    console.log('Report faculty ID:', report.facultyId);
    
    // Only allow deletion if report is in Draft status
    if (report.status !== 'Draft') {
      console.log('Cannot delete - not in draft status');
      return res.status(400).json({ message: 'Cannot delete submitted reports' });
    }
    
    // Check if user owns the report
    if (report.facultyId.toString() !== req.user._id.toString()) {
      console.log('User does not own this report');
      return res.status(403).json({ message: 'You can only delete your own reports' });
    }
    
    await ExpenseReport.findByIdAndDelete(req.params.id);
    console.log('Report deleted successfully');
    
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
};