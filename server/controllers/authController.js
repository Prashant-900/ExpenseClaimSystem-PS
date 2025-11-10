import User from '../models/User.js';
import { uploadToS3 } from '../middleware/fileUploadMiddleware.js';
import { getProfileImageUrl } from '../utils/imageUtils.js';
import { ErrorTypes } from '../utils/appError.js';

export const saveUser = async (req, res) => {
  try {
    // Get auth from Clerk if available
    const auth = req.auth;
    const provided = req.body || {};
    const { name, email, department, studentId, role: providedRole } = provided;

    console.log('=== saveUser called ===');
    console.log('Request body:', JSON.stringify(provided, null, 2));
    console.log('Auth present:', !!auth);

    if (!name || !email) {
      const error = ErrorTypes.MISSING_FIELD('name or email');
      console.error('Missing required fields:', { name: !!name, email: !!email });
      return res.status(error.statusCode).json({ message: error.message });
    }

    // Get Clerk user ID if authenticated
    const userId = auth ? (auth.userId || auth.sub) : null;
    
    console.log('Clerk userId:', userId);
    console.log('Processing user registration for email:', email);

    // Try to find existing user by clerkId or email
    let user = null;
    if (userId) {
      user = await User.findOne({ clerkId: userId });
      if (!user) {
        user = await User.findOne({ email });
      }
    } else {
      user = await User.findOne({ email });
    }

    console.log('Existing user found:', !!user);

    if (user) {
      // Update existing user
      const updateFields = { name, department };
      
      // Only update studentId if it's provided and not empty
      if (studentId && studentId.trim()) {
        updateFields.studentId = studentId.trim();
      }
      
      // If user was created without Clerk but now has Clerk ID, update it
      if (userId && user.clerkId !== userId) {
        updateFields.clerkId = userId;
      }
      
      user = await User.findByIdAndUpdate(user._id, updateFields, { new: true, runValidators: true });
      
      console.log('Updated existing user:', {
        _id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        role: user.role
      });
    } else {
      // Determine role: known domains -> specific roles; otherwise default to Faculty
      let role = providedRole || 'Student';
      if (email?.endsWith('@faculty.iitmandi.ac.in')) role = 'Faculty';
      else if (email?.endsWith('@audit.iitmandi.ac.in')) role = 'Audit';
      else if (email?.endsWith('@finance.iitmandi.ac.in')) role = 'Finance';
      else if (email?.endsWith('@admin.iitmandi.ac.in')) role = 'Admin';
      else if (email?.endsWith('@students.iitmandi.ac.in')) role = 'Student';
      else {
        // For non-IIT emails, default to Faculty (external users/collaborators)
        role = 'Faculty';
      }

      // Prepare user data
      const userData = {
        clerkId: userId || `local:${email}`,
        name,
        email,
        role,
        department
      };

      // Only add studentId if role is Student AND studentId is provided
      if (role === 'Student' && studentId && studentId.trim()) {
        userData.studentId = studentId.trim();
      } else if (role === 'Student' && email?.endsWith('@students.iitmandi.ac.in') && !studentId) {
        // For IIT student emails without studentId, use email prefix as fallback
        userData.studentId = email.split('@')[0];
      }

      // Create new user with Clerk ID if available
      user = await User.create(userData);
      
      console.log('Created new user:', {
        _id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        role: user.role,
        studentId: user.studentId
      });
    }

    console.log('✅ User saved successfully to MongoDB:', {
      _id: user._id,
      email: user.email,
      clerkId: user.clerkId,
      role: user.role,
      department: user.department,
      studentId: user.studentId
    });

    res.json({ 
      message: 'User saved successfully',
      user: user.toObject() 
    });
  } catch (error) {
    console.error('❌ Error in saveUser:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    
    const appError = error.code === 11000 
      ? ErrorTypes.DUPLICATE('Email or Student ID')
      : ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, bio, studentId } = req.body;
    const updateData = { name, phone, department, bio };

    // Only allow students to update studentId
    if (req.user.role === 'Student' && studentId !== undefined) {
      updateData.studentId = studentId;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      const error = ErrorTypes.MISSING_FIELD('Profile image');
      return res.status(error.statusCode).json({ message: error.message });
    }

    const fileName = await uploadToS3(req.file, req.user._id, 'profile');
    // Direct public S3 URL (bucket is public)
    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    res.json({ message: 'Profile image uploaded successfully', imageUrl });
  } catch (error) {
    const appError = ErrorTypes.FILE_UPLOAD_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      const error = ErrorTypes.USER_NOT_FOUND();
      return res.status(error.statusCode).json({ message: error.message });
    }

    // Get profile image URL
    const profileImage = getProfileImageUrl(user._id);

    res.json({ ...user.toObject(), profileImage });
  } catch (error) {
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};