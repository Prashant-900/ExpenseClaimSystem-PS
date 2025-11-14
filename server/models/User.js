import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Faculty', 'School Chair', 'Dean SRIC', 'Director', 'Audit', 'Finance', 'Admin'], default: 'Faculty' },
  studentId: { 
    type: String, 
    required: function() {
      return this.role === 'Student';
    },
    unique: true,
    sparse: true
  },
  facultyEmail: { type: String },
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

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);