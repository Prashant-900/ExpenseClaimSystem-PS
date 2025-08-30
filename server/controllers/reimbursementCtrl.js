import Reimbursement from '../models/Reimbursement.js';
import User from '../models/User.js';
import { sendStatusUpdateEmail } from '../utils/emailService.js';
import { uploadToMinio } from '../middleware/upload.js';

export const createReimbursement = async (req, res) => {
  try {
    const { 
      title, expenseType, expenseDate, amount, description, receipt, facultyEmail,
      // Travel fields
      origin, destination, travelMode, distance, startDate, endDate,
      // Meal fields
      restaurantName, mealType, attendees, perPersonCost,
      // Accommodation fields
      hotelName, location, checkinDate, checkoutDate, nightsStayed,
      // Office Supplies fields
      itemName, quantity, vendorName, invoiceNumber,
      // Misc fields
      customNotes
    } = req.body;
    
    // Handle image uploads
    let imageFileNames = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileName = await uploadToMinio(file, req.user._id);
        imageFileNames.push(fileName);
      }
    }
    
    const baseData = {
      title,
      expenseType,
      expenseDate,
      amount,
      description,
      receipt,
      images: imageFileNames,
      // Travel fields
      origin, destination, travelMode, distance, startDate, endDate,
      // Meal fields
      restaurantName, mealType, attendees, perPersonCost,
      // Accommodation fields
      hotelName, location, checkinDate, checkoutDate, nightsStayed,
      // Office Supplies fields
      itemName, quantity, vendorName, invoiceNumber,
      // Misc fields
      customNotes
    };
    
    let reimbursement;
    
    if (req.user.role === 'Faculty') {
      // Faculty requests go directly to Audit
      reimbursement = await Reimbursement.create({
        ...baseData,
        facultySubmitterId: req.user._id,
        status: 'Approved - Audit'
      });
    } else {
      // Student requests need faculty approval
      const faculty = await User.findOne({ email: facultyEmail, role: 'Faculty' });
      
      if (!faculty) {
        reimbursement = await Reimbursement.create({
          ...baseData,
          studentId: req.user._id,
          status: 'Rejected',
          facultyRemarks: 'Unknown faculty email provided'
        });
        return res.status(201).json(reimbursement);
      }
      
      reimbursement = await Reimbursement.create({
        ...baseData,
        studentId: req.user._id,
        facultyId: faculty._id
      });
      
      await sendStatusUpdateEmail(faculty.email, reimbursement, 'Submitted for Review');
    }

    res.status(201).json(reimbursement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReimbursements = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'Student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'Faculty') {
      if (req.query.pending === 'true') {
        query = { facultyId: req.user._id, status: 'Pending - Faculty' };
      } else {
        query.$or = [
          { facultyId: req.user._id },
          { facultySubmitterId: req.user._id }
        ];
      }
    } else if (req.user.role === 'Audit') {
      if (req.query.pending === 'true') {
        query.status = 'Approved - Audit';
      } else {
        query.$or = [
          { status: 'Approved - Audit' },
          { status: 'Approved - Finance' },
          { status: 'Rejected', auditRemarks: { $exists: true } },
          { status: 'Completed' },
          { status: 'Sent Back - Audit' }
        ];
      }
    } else if (req.user.role === 'Finance') {
      if (req.query.pending === 'true') {
        query.status = 'Approved - Finance';
      } else {
        query.$or = [
          { status: 'Approved - Finance' },
          { status: 'Completed' },
          { status: 'Rejected', financeRemarks: { $exists: true } },
          { status: 'Sent Back - Finance' }
        ];
      }
    }

    const reimbursements = await Reimbursement.find(query)
      .populate('studentId', 'name email')
      .populate('facultySubmitterId', 'name email')
      .populate('facultyId', 'name email')
      .populate('auditId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(reimbursements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student requests assigned to faculty
export const getStudentRequests = async (req, res) => {
  try {
    if (req.user.role !== 'Faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = { 
      facultyId: req.user._id,
      studentId: { $exists: true }
    };

    const requests = await Reimbursement.find(query)
      .populate('studentId', 'name email')
      .populate('facultyId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get faculty's own requests
export const getFacultyOwnRequests = async (req, res) => {
  try {
    if (req.user.role !== 'Faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = { 
      facultySubmitterId: req.user._id
    };

    const requests = await Reimbursement.find(query)
      .populate('facultySubmitterId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReimbursementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    
    const reimbursement = await Reimbursement.findById(id).populate('studentId').populate('facultySubmitterId');
    if (!reimbursement) return res.status(404).json({ message: 'Reimbursement not found' });

    if (req.user.role === 'Faculty' && reimbursement.status === 'Pending - Faculty') {
      if (status === 'approve') {
        reimbursement.status = 'Approved - Audit';
        reimbursement.approvedByFaculty = new Date();
      } else if (status === 'reject') {
        reimbursement.status = 'Rejected';
      } else if (status === 'sendback') {
        reimbursement.status = 'Sent Back - Faculty';
      }
      reimbursement.facultyRemarks = remarks;
    } else if (req.user.role === 'Audit' && reimbursement.status === 'Approved - Audit') {
      if (status === 'approve') {
        reimbursement.status = 'Approved - Finance';
        reimbursement.approvedByAudit = new Date();
      } else if (status === 'reject') {
        reimbursement.status = 'Rejected';
      } else if (status === 'sendback') {
        reimbursement.status = 'Sent Back - Audit';
      }
      reimbursement.auditRemarks = remarks;
    } else if (req.user.role === 'Finance' && reimbursement.status === 'Approved - Finance') {
      if (status === 'approve') {
        reimbursement.status = 'Completed';
        reimbursement.approvedByFinance = new Date();
      } else if (status === 'reject') {
        reimbursement.status = 'Rejected';
      } else if (status === 'sendback') {
        reimbursement.status = 'Sent Back - Finance';
      }
      reimbursement.financeRemarks = remarks;
    } else {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    await reimbursement.save();
    const submitterEmail = reimbursement.studentId?.email || reimbursement.facultySubmitterId?.email;
    await sendStatusUpdateEmail(submitterEmail, reimbursement, reimbursement.status, remarks);

    res.json(reimbursement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};