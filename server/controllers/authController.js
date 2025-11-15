import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Helper to generate 6-digit numeric OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper to send verification email
const sendVerificationEmail = async (email, name, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `Expense Claim System <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your email - Expense Claim System',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 520px; margin: 0 auto;">
        <h2 style="color:#111827;">Email Verification</h2>
        <p>Hi ${name || 'User'},</p>
        <p>Thank you for signing up to the IIT Mandi Expense Claim System.</p>
        <p>Your One-Time Password (OTP) for email verification is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color:#2563eb;">${otp}</p>
        <p>This code will expire in <strong>10 minutes</strong>. Please enter it on the verification screen to activate your account.</p>
        <p>If you did not initiate this request, you can safely ignore this email.</p>
        <hr style="margin:24px 0; border:none; border-top:1px solid #e5e7eb;" />
        <p style="font-size: 12px; color:#6b7280;">© ${new Date().getFullYear()} IIT Mandi Expense Claim System</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const register = async (req, res) => {
  try {
    const { name, email, password, facultyEmail, department, studentId } = req.body;

    // Validate email domain
    const validDomains = [
      '@students.iitmandi.ac.in',
      '@faculty.iitmandi.ac.in',
      '@audit.iitmandi.ac.in',
      '@finance.iitmandi.ac.in',
      '@admin.iitmandi.ac.in',
      '@iitmandi.ac.in'
    ];

    const isValidDomain = validDomains.some(domain => email.endsWith(domain));
    if (!isValidDomain) {
      return res.status(400).json({ message: 'Invalid email domain. Use IIT Mandi email.' });
    }
    
    // Assign role based on email domain
    let role = 'Student';
    if (email.endsWith('@faculty.iitmandi.ac.in') || email.endsWith('@iitmandi.ac.in')) role = 'Faculty';
    else if (email.endsWith('@audit.iitmandi.ac.in')) role = 'Audit';
    else if (email.endsWith('@finance.iitmandi.ac.in')) role = 'Finance';
    else if (email.endsWith('@admin.iitmandi.ac.in')) role = 'Admin';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.emailVerified) {
        return res.status(400).json({ message: 'User already exists' });
      }
      // If user exists but not verified, regenerate OTP and resend
      const otp = generateOTP();
      existingUser.emailVerificationOTPHash = await bcrypt.hash(otp, 10);
      existingUser.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
      // Update other fields in case user is retrying with corrected data (name/department/studentId)
      existingUser.name = name || existingUser.name;
      existingUser.department = department || existingUser.department;
      if (existingUser.role === 'Student' && studentId) {
        existingUser.studentId = studentId;
      }
      await existingUser.save();
      try {
        await sendVerificationEmail(existingUser.email, existingUser.name, otp);
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr);
        return res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
      }
      return res.status(200).json({ message: 'Verification OTP resent to your email.', email: existingUser.email });
    }

    const userData = { name, email, password, role, facultyEmail, department };

    // Add studentId for students
    if (role === 'Student' && studentId) {
      userData.studentId = studentId;
    }

    // Generate OTP and store hashed version
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    userData.emailVerificationOTPHash = otpHash;
    userData.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    userData.emailVerified = false;

    const user = await User.create(userData);

    try {
      await sendVerificationEmail(user.email, user.name, otp);
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr);
      // If email fails, clean up user to avoid orphaned account
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
    }

    res.status(201).json({
      message: 'Registration initiated. Please check your email for the OTP to verify your account.',
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' });
    if (!user.emailVerificationOTPHash || !user.emailVerificationOTPExpires) {
      return res.status(400).json({ message: 'No verification process initiated' });
    }
    if (user.emailVerificationOTPExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, user.emailVerificationOTPHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.emailVerified = true;
    user.emailVerificationOTPHash = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, studentId: user.studentId }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' });

    const otp = generateOTP();
    user.emailVerificationOTPHash = await bcrypt.hash(otp, 10);
    user.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendVerificationEmail(user.email, user.name, otp);
    } catch (err) {
      console.error('Resend email failed:', err);
      return res.status(500).json({ message: 'Failed to send verification email.' });
    }

    res.json({ message: 'OTP resent. Please check your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfileImageUrl = (userId) => {
  // Return direct public S3 URL
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/profiles/${userId}/profile.jpg`;
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email domain
    const validDomains = [
      '@students.iitmandi.ac.in',
      '@faculty.iitmandi.ac.in',
      '@audit.iitmandi.ac.in',
      '@finance.iitmandi.ac.in',
      '@admin.iitmandi.ac.in',
      '@iitmandi.ac.in'
    ];
    
    const isValidDomain = validDomains.some(domain => email.endsWith(domain));
    if (!isValidDomain) {
      return res.status(400).json({ message: 'Invalid email domain. Use IIT Mandi email.' });
    }
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Email not verified. Please complete verification before logging in.' });
    }

    const profileImage = getProfileImageUrl(user._id);
    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId, department: user.department, profileImage }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No profile image uploaded' });
    }

    // Upload to S3
    const { uploadToS3 } = await import('../middleware/fileUploadMiddleware.js');
    const s3Key = await uploadToS3(req.file, req.user._id, 'profile');
    
    if (!s3Key) {
      return res.status(500).json({ message: 'Failed to upload profile image to S3' });
    }

    // Update user's profile image reference in database (optional)
    const user = await User.findById(req.user._id);
    user.profileImage = s3Key;
    await user.save();

    const profileImageUrl = getProfileImageUrl(req.user._id);
    
    res.json({ 
      message: 'Profile image uploaded successfully',
      profileImage: profileImageUrl
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get profile image URL from S3
    const profileImage = getProfileImageUrl(user._id);

    res.json({ ...user.toObject(), profileImage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};