import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['Student', 'Faculty', 'School Chair', 'Dean SRIC', 'Director', 'Audit', 'Finance', 'Admin'], default: 'Student' },
  studentId: { 
    type: String, 
    required: function() {
      return this.role === 'Student';
    },
    unique: true,
    sparse: true
  },
  roleno: {
    type: String,
    default: ''
  },
  phone: { type: String },
  department: { 
    type: String, 
    enum: ['SCEE', 'SMME', 'SCENE', 'SBB', 'SCS', 'SMSS', 'SPS', 'SoM', 'SHSS', 'CAIR', 'IKSMHA', 'AMRC', 'CQST', 'C4DFED', 'BioX Centre'],
    required: function() {
      return ['Student', 'Faculty', 'School Chair'].includes(this.role);
    }
  },
  bio: { type: String },
  profileImage: { type: String },
  // Email verification fields
  emailVerified: { type: Boolean, default: false },
  emailVerificationOTPHash: { type: String },
  emailVerificationOTPExpires: { type: Date }
}, { timestamps: true });

export default mongoose.model('User', userSchema);