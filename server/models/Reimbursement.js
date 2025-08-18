import mongoose from 'mongoose';

const reimbursementSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  receipt: { type: String },
  status: { 
    type: String, 
    enum: ['Pending - Manager', 'Approved - Finance', 'Rejected', 'Completed'], 
    default: 'Pending - Manager' 
  },
  managerRemarks: { type: String },
  financeRemarks: { type: String },
  approvedByManager: { type: Date },
  approvedByFinance: { type: Date }
}, { timestamps: true });

export default mongoose.model('Reimbursement', reimbursementSchema);