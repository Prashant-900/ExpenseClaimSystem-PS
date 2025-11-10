import ExpenseReport from '../models/ExpenseReport.js';
import User from '../models/User.js';
import { uploadToS3 } from '../middleware/fileUploadMiddleware.js';
import { getSchoolChair, getDeanSRIC, getDirector } from '../utils/approvalWorkflow.js';
import { getProfileImageUrl } from '../utils/imageUtils.js';
import { recalculateTotals } from '../utils/expenseUtils.js';
import { ErrorTypes } from '../utils/appError.js';

export const createExpenseReport = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['expensePeriodStart', 'expensePeriodEnd', 'purposeOfExpense', 'reportType', 'fundingSource'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }
    
    // Validate that students have studentId before creating reports
    if (req.user.role === 'Student') {
      if (!req.user.studentId || req.user.studentId.trim() === '') {
        return res.status(400).json({ 
          message: 'Student ID is required. Please complete your profile before creating expense reports.',
          requiresProfileUpdate: true
        });
      }
    }
    
    const reportData = {
      ...req.body,
      submitterId: req.user._id,
      submitterRole: req.user.role
    };
    
    // For student submissions, don't assign specific faculty
    if (req.user.role === 'Student') {
      reportData.department = req.user.department;
      reportData.studentId = req.user.studentId; // Include student ID in report
    }
    
    const report = await ExpenseReport.create(reportData);
    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating expense report:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
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
        // Student reports assigned to this faculty needing faculty approval
        query = { 
          facultyId: req.user._id,
          submitterRole: 'Student',
          status: 'Submitted' 
        };
      } else if (req.query.reviewed === 'true') {
        // Student reports assigned to this faculty already reviewed by this faculty
        query = { 
          facultyId: req.user._id,
          submitterRole: 'Student',
          status: { $in: ['Draft', 'Faculty Approved', 'School Chair Approved', 'Dean SRIC Approved', 'Director Approved', 'Audit Approved', 'Finance Approved', 'Rejected'] } 
        };
      } else {
        // Default: only faculty's own reports
        query.submitterId = req.user._id;
      }
    } else if (req.user.role === 'School Chair') {
      // Get reports from their school that need school chair approval
      if (req.query.pending === 'true') {
        query = {
          department: req.user.department,
          status: 'Faculty Approved'
        };
      } else if (req.query.processed === 'true') {
        query = {
          department: req.user.department,
          status: { $in: ['School Chair Approved', 'Dean SRIC Approved', 'Director Approved', 'Audit Approved', 'Finance Approved', 'Rejected'] }
        };
      } else {
        // Default: pending reports
        query = {
          department: req.user.department,
          status: 'Faculty Approved'
        };
      }
    } else if (req.user.role === 'Dean SRIC') {
      // Get Project Fund reports that need Dean SRIC approval
      if (req.query.pending === 'true') {
        query = {
          fundType: 'Project Fund',
          status: 'School Chair Approved'
        };
      } else if (req.query.processed === 'true') {
        query = {
          fundType: 'Project Fund',
          status: { $in: ['Dean SRIC Approved', 'Audit Approved', 'Finance Approved', 'Rejected'] }
        };
      } else {
        // Default: pending reports
        query = {
          fundType: 'Project Fund',
          status: 'School Chair Approved'
        };
      }
    } else if (req.user.role === 'Director') {
      // Get Institute Fund reports that need Director approval
      if (req.query.pending === 'true') {
        query = {
          fundType: 'Institute Fund',
          status: 'School Chair Approved'
        };
      } else if (req.query.processed === 'true') {
        query = {
          fundType: 'Institute Fund',
          status: { $in: ['Director Approved', 'Audit Approved', 'Finance Approved', 'Rejected'] }
        };
      } else {
        // Default: pending reports
        query = {
          fundType: 'Institute Fund',
          status: 'School Chair Approved'
        };
      }
    } else if (req.user.role === 'Audit') {
      if (req.query.all === 'true') {
        // Audit-all endpoint: only processed reports (exclude pending)
        query.status = { $in: ['Audit Approved', 'Finance Approved', 'Rejected'] };
      } else {
        // Default audit endpoint: reports that need audit review (after various approval paths)
        query = {
          $or: [
            { status: 'School Chair Approved', fundType: { $in: ['Department/School Fund', 'Professional Development Allowance'] } },
            { status: 'Dean SRIC Approved' },
            { status: 'Director Approved' }
          ]
        };
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
    
    // Add profile images
    const reportsWithImages = await Promise.all(reports.map(async (report) => {
      const reportObj = report.toObject();
      if (reportObj.submitterId) {
        reportObj.submitterId.profileImage = getProfileImageUrl(reportObj.submitterId._id);
      }
      return reportObj;
    }));
    
    res.json(reportsWithImages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to recalculate totals
// NOTE: Moved to expenseUtils.js - Using imported function instead

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
    const { action, remarks, fundType, projectId } = req.body;
    const report = await ExpenseReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const currentDate = new Date();
    
    // Faculty approval - now includes fund type categorization
    if (req.user.role === 'Faculty' && report.status === 'Submitted') {
      if (action === 'approve') {
        // Validate fund type selection
        if (!fundType) {
          return res.status(400).json({ message: 'Fund type must be selected before approval' });
        }
        
        // Validate project ID for Project Fund
        if (fundType === 'Project Fund' && !projectId) {
          return res.status(400).json({ message: 'Project ID is required for Project Fund' });
        }
        
        report.status = 'Faculty Approved';
        report.fundType = fundType;
        if (projectId) {
          report.projectId = projectId;
        }
        
        // Only set facultyId and facultyName if not already set (i.e., if student submitted)
        if (!report.facultyId && report.submitterRole === 'Student') {
          report.facultyId = req.user._id;
          report.facultyName = req.user.name;
        }
        report.facultyApproval = { approved: true, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'reject') {
        report.status = 'Rejected';
        if (!report.facultyId && report.submitterRole === 'Student') {
          report.facultyId = req.user._id;
          report.facultyName = req.user.name;
        }
        report.facultyApproval = { approved: false, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'sendback') {
        report.status = 'Draft';
        report.facultyApproval = { approved: false, date: currentDate, remarks, action: 'sendback', approvedBy: req.user.name, approvedById: req.user._id };
      }
    }
    // School Chair approval
    else if (req.user.role === 'School Chair' && report.status === 'Faculty Approved') {
      // Verify this school chair is for the report's department
      const schoolChair = await getSchoolChair(report.department);
      if (!schoolChair || schoolChair._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to approve reports for this school' });
      }
      
      if (action === 'approve') {
        report.status = 'School Chair Approved';
        report.schoolChairApproval = { approved: true, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'reject') {
        report.status = 'Rejected';
        report.schoolChairApproval = { approved: false, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'sendback') {
        report.status = 'Draft'; // Send back to creator
        report.schoolChairApproval = { approved: false, date: currentDate, remarks, action: 'sendback', approvedBy: req.user.name, approvedById: req.user._id };
      }
    }
    // Dean SRIC approval (for Project Fund only)
    else if (req.user.role === 'Dean SRIC' && report.status === 'School Chair Approved' && report.fundType === 'Project Fund') {
      // Any user with Dean SRIC role can approve
      // Optional: verify against SchoolAdmin for additional security
      const deanSRIC = await getDeanSRIC();
      if (deanSRIC && deanSRIC._id.toString() !== req.user._id.toString()) {
        console.warn(`Dean SRIC mismatch: User ${req.user._id} not in SchoolAdmin, but has Dean SRIC role`);
      }
      
      if (action === 'approve') {
        report.status = 'Dean SRIC Approved';
        report.deanSRICApproval = { approved: true, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'reject') {
        report.status = 'Rejected';
        report.deanSRICApproval = { approved: false, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'sendback') {
        report.status = 'Draft'; // Send back to creator
        report.deanSRICApproval = { approved: false, date: currentDate, remarks, action: 'sendback', approvedBy: req.user.name, approvedById: req.user._id };
      }
    }
    // Director approval (for Institute Fund only)
    else if (req.user.role === 'Director' && report.status === 'School Chair Approved' && report.fundType === 'Institute Fund') {
      // Any user with Director role can approve
      // Optional: verify against SchoolAdmin for additional security
      const director = await getDirector();
      if (director && director._id.toString() !== req.user._id.toString()) {
        console.warn(`Director mismatch: User ${req.user._id} not in SchoolAdmin, but has Director role`);
      }
      
      if (action === 'approve') {
        report.status = 'Director Approved';
        report.directorApproval = { approved: true, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'reject') {
        report.status = 'Rejected';
        report.directorApproval = { approved: false, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'sendback') {
        report.status = 'Draft'; // Send back to creator
        report.directorApproval = { approved: false, date: currentDate, remarks, action: 'sendback', approvedBy: req.user.name, approvedById: req.user._id };
      }
    }
    // Audit approval - comes after School Chair (for Dept/Prof Dev) or Dean SRIC (for Project) or Director (for Institute)
    else if (req.user.role === 'Audit') {
      // Verify correct workflow position based on fund type
      let canApprove = false;
      
      if (report.fundType === 'Institute Fund' && report.status === 'Director Approved') {
        canApprove = true;
      } else if (report.fundType === 'Project Fund' && report.status === 'Dean SRIC Approved') {
        canApprove = true;
      } else if ((report.fundType === 'Department/School Fund' || report.fundType === 'Professional Development Allowance') 
                 && report.status === 'School Chair Approved') {
        canApprove = true;
      }
      
      if (!canApprove) {
        return res.status(400).json({ 
          message: `Cannot approve at this stage. Current status: ${report.status}, Fund type: ${report.fundType}. Please wait for the correct approval stage.` 
        });
      }
      
      if (action === 'approve') {
        report.status = 'Audit Approved';
        report.auditApproval = { approved: true, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'reject') {
        report.status = 'Rejected';
        report.auditApproval = { approved: false, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'sendback') {
        // Send back to creator
        report.status = 'Draft';
        report.auditApproval = { approved: false, date: currentDate, remarks, action: 'sendback', approvedBy: req.user.name, approvedById: req.user._id };
      }
    }
    // Finance approval - final stage
    else if (req.user.role === 'Finance' && report.status === 'Audit Approved') {
      if (action === 'approve') {
        report.status = 'Finance Approved';
        report.financeApproval = { approved: true, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'reject') {
        report.status = 'Rejected';
        report.financeApproval = { approved: false, date: currentDate, remarks, approvedBy: req.user.name, approvedById: req.user._id };
      } else if (action === 'sendback') {
        report.status = 'Draft'; // Send back to creator
        report.financeApproval = { approved: false, date: currentDate, remarks, action: 'sendback', approvedBy: req.user.name, approvedById: req.user._id };
      }
    } else {
      return res.status(400).json({ message: 'Invalid approval action for current status and user role' });
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
      receiptFileName = await uploadToS3(req.file, req.user._id);
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

// DEBUG: Test endpoint to see all reports - REMOVED (not needed in production)

export const deleteExpenseReport = async (req, res) => {
  try {
    const report = await ExpenseReport.findById(req.params.id);
    
    if (!report) {
      const error = ErrorTypes.REPORT_NOT_FOUND();
      return res.status(error.statusCode).json({ message: error.message });
    }
    
    // Only allow deletion if report is in Draft status
    if (report.status !== 'Draft') {
      const error = ErrorTypes.INVALID_STATE('Cannot delete submitted reports');
      return res.status(error.statusCode).json({ message: error.message });
    }
    
    // Check if user owns the report
    if (report.submitterId.toString() !== req.user._id.toString()) {
      const error = ErrorTypes.FORBIDDEN();
      return res.status(error.statusCode).json({ message: error.message });
    }
    
    await ExpenseReport.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};