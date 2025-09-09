import Reimbursement from '../models/Reimbursement.js';
import User from '../models/User.js';
import { sendStatusUpdateEmail } from '../utils/emailService.js';
import { uploadToMinio } from '../middleware/fileUploadMiddleware.js';

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

export const createReimbursement = async (req, res) => {
  try {
    const { 
      title, expenseType, expenseDate, amount, description, receipt, facultyEmail, country,
      // Travel fields
      originState, originCity, destinationState, destinationCity, travelMode, distance, startDate, endDate,
      // Meal fields
      restaurantName, mealType, attendees, perPersonCost,
      // Accommodation fields
      hotelName, accommodationState, accommodationCity, checkinDate, checkoutDate, nightsStayed,
      // Office Supplies fields
      itemName, quantity, vendorName, invoiceNumber,
      // Misc fields
      customNotes
    } = req.body;
    
    // Handle image uploads and existing images from drafts
    let imageFileNames = [];
    
    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileName = await uploadToMinio(file, req.user._id);
        imageFileNames.push(fileName);
      }
    }
    
    // Handle existing images from drafts
    if (req.body.images) {
      const existingImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      imageFileNames = [...imageFileNames, ...existingImages];
    }
    
    const baseData = {
      title,
      expenseType,
      expenseDate,
      amount,
      description,
      receipt,
      images: imageFileNames,
      country,
      // Travel fields
      originState, originCity, destinationState, destinationCity, travelMode, distance, startDate, endDate,
      // Meal fields
      restaurantName, mealType, attendees, perPersonCost,
      // Accommodation fields
      hotelName, accommodationState, accommodationCity, checkinDate, checkoutDate, nightsStayed,
      // Office Supplies fields
      itemName, quantity, vendorName, invoiceNumber,
      // Misc fields
      customNotes
    };
    
    let reimbursement;
    
    if (req.user.role === 'Faculty') {
      // Faculty requests go to Audit
      reimbursement = await Reimbursement.create({
        ...baseData,
        facultySubmitterId: req.user._id,
        status: 'Pending - Audit Review'
      });
    } else {
      // Student requests need faculty approval first
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
        facultyId: faculty._id,
        facultyEmail: facultyEmail
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
        query = { facultyId: req.user._id, status: 'Pending - Faculty Review' };
      } else {
        query.$or = [
          { facultyId: req.user._id },
          { facultySubmitterId: req.user._id }
        ];
      }
    } else if (req.user.role === 'Audit') {
      if (req.query.pending === 'true') {
        query.status = 'Pending - Audit Review';
      } else {
        query.$or = [
          { status: 'Pending - Audit Review' },
          { status: 'Pending - Finance Review' },
          { status: 'Rejected', auditRemarks: { $exists: true } },
          { status: 'Completed' },
          { status: 'Sent Back - Audit' }
        ];
      }
    } else if (req.user.role === 'Finance') {
      if (req.query.pending === 'true') {
        query.status = 'Pending - Finance Review';
      } else {
        query.$or = [
          { status: 'Pending - Finance Review' },
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
    
    // Add profile images for populated users
    for (const request of requests) {
      if (request.studentId) {
        request.studentId.profileImage = await getProfileImageUrl(request.studentId._id);
      }
      if (request.facultyId) {
        request.facultyId.profileImage = await getProfileImageUrl(request.facultyId._id);
      }
    }
    
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
    
    // Add profile images for populated users
    for (const request of requests) {
      if (request.facultySubmitterId) {
        request.facultySubmitterId.profileImage = await getProfileImageUrl(request.facultySubmitterId._id);
      }
    }
    
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

    if (req.user.role === 'Faculty' && reimbursement.status === 'Pending - Faculty Review') {
      if (status === 'approve') {
        reimbursement.status = 'Pending - Audit Review';
        reimbursement.approvedByFaculty = new Date();
      } else if (status === 'reject') {
        reimbursement.status = 'Rejected';
      } else if (status === 'sendback') {
        reimbursement.status = 'Sent Back - Faculty';
      }
      reimbursement.facultyRemarks = remarks;
    } else if (req.user.role === 'Audit' && reimbursement.status === 'Pending - Audit Review') {
      if (status === 'approve') {
        reimbursement.status = 'Pending - Finance Review';
        reimbursement.approvedByAudit = new Date();
      } else if (status === 'reject') {
        reimbursement.status = 'Rejected';
      } else if (status === 'sendback') {
        reimbursement.status = 'Sent Back - Audit';
      }
      reimbursement.auditRemarks = remarks;
    } else if (req.user.role === 'Finance' && reimbursement.status === 'Pending - Finance Review') {
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