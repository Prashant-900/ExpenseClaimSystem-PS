import mongoose from 'mongoose';

const schoolAdminSchema = new mongoose.Schema({
  school: {
    type: String,
    enum: ['SCEE', 'SMME', 'SCENE', 'SBB', 'SCS', 'SMSS', 'SPS', 'SoM', 'SHSS', 'CAIR', 'IKSMHA', 'AMRC', 'CQST', 'C4DFED', 'BioX Centre'],
    required: true,
    unique: true
  },
  schoolChairId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  schoolChairName: { type: String },
  deanSRICId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deanSRICName: { type: String },
  directorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  directorName: { type: String }
}, { timestamps: true });

export default mongoose.model('SchoolAdmin', schoolAdminSchema);
