import mongoose from 'mongoose';

const reimbursementSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facultySubmitterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  auditId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Basic expense details
  title: { type: String, required: true },
  expenseType: { type: String, enum: ['Travel', 'Meal', 'Accommodation', 'Office Supplies', 'Misc'], required: true },
  expenseDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  receipt: { type: String },
  images: [{ type: String }],
  
  // Travel specific fields
  origin: { type: String },
  destination: { type: String },
  travelMode: { type: String },
  distance: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date },
  
  // Meal specific fields
  restaurantName: { type: String },
  mealType: { type: String },
  attendees: { type: Number },
  perPersonCost: { type: Number },
  
  // Accommodation specific fields
  hotelName: { type: String },
  location: { type: String },
  checkinDate: { type: Date },
  checkoutDate: { type: Date },
  nightsStayed: { type: Number },
  
  // Office Supplies specific fields
  itemName: { type: String },
  quantity: { type: Number },
  vendorName: { type: String },
  invoiceNumber: { type: String },
  
  // Misc specific fields
  customNotes: { type: String },
  
  status: { 
    type: String, 
    enum: ['Pending - Faculty', 'Approved - Audit', 'Approved - Finance', 'Rejected', 'Completed', 'Sent Back - Faculty', 'Sent Back - Audit', 'Sent Back - Finance'], 
    default: 'Pending - Faculty' 
  },
  facultyRemarks: { type: String },
  auditRemarks: { type: String },
  financeRemarks: { type: String },
  approvedByFaculty: { type: Date },
  approvedByAudit: { type: Date },
  approvedByFinance: { type: Date }
}, { timestamps: true });

export default mongoose.model('Reimbursement', reimbursementSchema);