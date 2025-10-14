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
    
    // For student submissions, don't assign specific faculty
    if (req.user.role === 'Student') {
      reportData.department = req.user.department;
    }
    
    const report = await ExpenseReport.create(reportData);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

export const getExpenseReports = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'Student') {
      query.submitterId = req.user._id;
    } else if (req.user.role === 'Faculty') {
      // Check if it's pending or reviewed endpoint
      if (req.query.pending === 'true') {
        // Student reports from same department needing faculty approval
        query = { 
          department: req.user.department, 
          submitterRole: 'Student',
          status: 'Submitted' 
        };
      } else if (req.query.reviewed === 'true') {
        // Student reports from same department already reviewed by this faculty
        query = { 
          department: req.user.department,
          submitterRole: 'Student',
          facultyId: req.user._id,
          status: { $in: ['Draft', 'Faculty Approved', 'Audit Approved', 'Finance Approved', 'Rejected'] } 
        };
      } else {
        // Default: only faculty's own reports
        query.submitterId = req.user._id;
      }
    } else if (req.user.role === 'Audit') {
      if (req.query.all === 'true') {
        // Audit-all endpoint: only processed reports (exclude pending)
        query.status = { $in: ['Audit Approved', 'Finance Approved', 'Rejected'] };
      } else {
        // Default audit endpoint: ALL reports that need audit review
        query = {
          $or: [
            { status: 'Faculty Approved' }, // Faculty reports
            { status: 'Submitted', submitterRole: 'Faculty' } // Just in case
          ]
        };
        console.log('Audit query:', query);
      }
    } else if (req.user.role === 'Finance') {
      if (req.query.processed === 'true') {
        // Finance processed endpoint: all reports that reached finance
        query.status = { $in: ['Audit Approved', 'Finance Approved', 'Rejected'] };
      } else {
        // Default finance endpoint: pending reports
        query.status = 'Audit Approved';
      }
    }
    
    const reports = await ExpenseReport.find(query)
      .populate('submitterId', 'name email department role')
      .populate('facultyId', 'name email department')
      .sort({ createdAt: -1 });
    
    if (req.user.role === 'Audit') {
      console.log('Found reports for audit:', reports.length);
      console.log('Report details:', reports.map(r => ({ id: r._id, status: r.status, submitter: r.submitterRole, submitterId: r.submitterId?.name })));
    }
    
    // Add profile images
    const reportsWithImages = await Promise.all(reports.map(async (report) => {
      const reportObj = report.toObject();
      if (reportObj.submitterId) {
        reportObj.submitterId.profileImage = await getProfileImageUrl(reportObj.submitterId._id);
      }
      return reportObj;
    }));
    
    res.json(reportsWithImages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to recalculate totals
const recalculateTotals = (report) => {
  if (report.items && report.items.length > 0) {
    report.totalAmount = report.items.reduce((sum, item) => sum + (item.amountInINR || item.amount || 0), 0);
    report.universityCardAmount = report.items
      .filter(item => item.paymentMethod === 'University Credit Card (P-Card)')
      .reduce((sum, item) => sum + (item.amountInINR || item.amount || 0), 0);
    report.personalAmount = report.items
      .filter(item => item.paymentMethod === 'Personal Funds (Reimbursement)')
      .reduce((sum, item) => sum + (item.amountInINR || item.amount || 0), 0);
    report.netReimbursement = report.personalAmount - (report.nonReimbursableAmount || 0);
  }
  return report;
};

export const getExpenseReportById = async (req, res) => {
  try {
    const report = await ExpenseReport.findById(req.params.id)
      .populate('submitterId', 'name email department role profileImage')
      .populate('facultyId', 'name email department');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Recalculate totals to ensure they're correct
    recalculateTotals(report);
    await report.save();
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExpenseReport = async (req, res) => {
  try {
    const report = await ExpenseReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Validate receipt images for all items if updating items
    if (req.body.items) {
      for (const item of req.body.items) {
        if (!item.receiptImage) {
          return res.status(400).json({ 
            message: 'Receipt image is required for all expense items' 
          });
        }
      }
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      report[key] = req.body[key];
    });
    
    // Recalculate totals if items are updated
    if (req.body.items || report.items.length > 0) {
      recalculateTotals(report);
    }
    
    await report.save();
    
    const updatedReport = await ExpenseReport.findById(req.params.id)
      .populate('submitterId', 'name email department role profileImage')
      .populate('facultyId', 'name email department');
    
    res.json(updatedReport);
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
    
    // Validate that all items have receipt images
    if (!report.items || report.items.length === 0) {
      return res.status(400).json({ message: 'At least one expense item is required' });
    }
    
    for (const item of report.items) {
      if (!item.receiptImage) {
        return res.status(400).json({ 
          message: 'All expense items must have receipt images before submission' 
        });
      }
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
        // Only set facultyId and facultyName if not already set (i.e., if student submitted)
        if (!report.facultyId && report.submitterRole === 'Student') {
          report.facultyId = req.user._id;
          report.facultyName = req.user.name;
        }
        report.facultyApproval = { approved: true, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'reject') {
        report.status = 'Rejected';
        // Only set facultyId and facultyName if not already set (i.e., if student submitted)
        if (!report.facultyId && report.submitterRole === 'Student') {
          report.facultyId = req.user._id;
          report.facultyName = req.user.name;
        }
        report.facultyApproval = { approved: false, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'sendback') {
        report.status = 'Draft';
        // Keep original facultyId and facultyName, just record who sent it back
        report.facultyApproval = { approved: false, date: currentDate, remarks, action: 'sendback', approvedBy: req.user.name, approvedById: req.user._id };
      }
    } else if (req.user.role === 'Audit' && report.status === 'Faculty Approved') {
      if (action === 'approve') {
        report.status = 'Audit Approved';
        report.auditApproval = { approved: true, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'reject') {
        report.status = 'Rejected';
        report.auditApproval = { approved: false, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'sendback') {
        report.status = 'Submitted';
        report.auditApproval = { approved: false, date: currentDate, remarks, action: 'sendback', approvedBy: req.user.name, approvedById: req.user._id };
      }
    } else if (req.user.role === 'Finance' && report.status === 'Audit Approved') {
      if (action === 'approve') {
        report.status = 'Finance Approved';
        report.financeApproval = { approved: true, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'reject') {
        report.status = 'Rejected';
        report.financeApproval = { approved: false, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'sendback') {
        report.status = 'Faculty Approved';
        report.financeApproval = { approved: false, date: currentDate, remarks, action: 'sendback', approvedBy: req.user.name, approvedById: req.user._id };
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
    recalculateTotals(report);
    
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
    recalculateTotals(report);
    
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
    recalculateTotals(report);
    
    await report.save();
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DEBUG: Test endpoint to see all reports
export const getAllReportsDebug = async (req, res) => {
  try {
    const allReports = await ExpenseReport.find({})
      .populate('submitterId', 'name email role')
      .sort({ createdAt: -1 });
    
    console.log('=== ALL REPORTS DEBUG ===');
    console.log('Total reports:', allReports.length);
    allReports.forEach(report => {
      console.log(`ID: ${report._id}, Status: ${report.status}, Submitter: ${report.submitterRole}, Name: ${report.submitterId?.name}`);
    });
    
    res.json(allReports.map(r => ({
      id: r._id,
      status: r.status,
      submitterRole: r.submitterRole,
      submitterName: r.submitterId?.name,
      createdAt: r.createdAt
    })));
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
    if (report.submitterId.toString() !== req.user._id.toString()) {
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