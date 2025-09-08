import mongoose from 'mongoose';

const expenseItemSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  category: { 
    type: String, 
    enum: [
      'Travel - Air', 'Travel - Train', 'Travel - Bus', 'Travel - Ground Transport',
      'Accommodation - Hotel', 'Accommodation - Guest House',
      'Meals - Breakfast', 'Meals - Lunch', 'Meals - Dinner',
      'Conference - Registration', 'Conference - Workshop',
      'Supplies - Lab', 'Supplies - Office',
      'Miscellaneous - Other'
    ], 
    required: true 
  },
  
  // Basic fields
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  amountInINR: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['University Credit Card (P-Card)', 'Personal Funds (Reimbursement)', 'Direct Invoice to University'], 
    required: true 
  },
  receipt: { type: String },
  receiptImage: { type: String, required: true },
  businessPurpose: { type: String, required: true },
  
  // Location fields
  country: { type: String },
  state: { type: String },
  city: { type: String },
  fromCountry: { type: String },
  fromState: { type: String },
  fromCity: { type: String },
  toCountry: { type: String },
  toState: { type: String },
  toCity: { type: String },
  distance: { type: Number },
  
  // Travel specific
  flightNumber: { type: String },
  airline: { type: String },
  ticketClass: { type: String },
  trainNumber: { type: String },
  trainName: { type: String },
  ticketType: { type: String },
  busOperator: { type: String },
  transportMode: { type: String },
  odometerReading: { type: Number },
  
  // Accommodation specific
  checkInDate: { type: Date },
  checkOutDate: { type: Date },
  hotelName: { type: String },
  facilityName: { type: String },
  numberOfNights: { type: Number },
  
  // Meals specific
  restaurantName: { type: String },
  numberOfAttendees: { type: Number },
  
  // Conference specific
  eventName: { type: String },
  eventLocation: { type: String },
  eventDates: { type: String },
  registrationType: { type: String },
  hostingInstitution: { type: String },
  
  // Supplies specific
  vendor: { type: String },
  itemDescription: { type: String },
  quantity: { type: Number },
  projectGrant: { type: String }
});

const expenseReportSchema = new mongoose.Schema({
  // Submitter Information
  submitterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submitterRole: { type: String, enum: ['Student', 'Faculty'], required: true },
  
  // Faculty Information (for student submissions)
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facultyName: { type: String },
  
  // Student Information (for student submissions)
  studentId: { type: String },
  studentName: { type: String },
  
  department: { 
    type: String, 
    enum: ['SCEE', 'SMME']
  },
  expenseReportDate: { type: Date, default: Date.now },
  expensePeriodStart: { type: Date, required: true },
  expensePeriodEnd: { type: Date, required: true },
  purposeOfExpense: { type: String, required: true },
  reportType: { 
    type: String, 
    enum: ['Teaching-related', 'Research-related', 'Administrative/Service', 'Other'], 
    required: true 
  },
  
  // Expense Summary
  fundingSource: { 
    type: String, 
    enum: ['Department Budget', 'Research Grant', 'Gift/Endowment Fund', 'Cost-Sharing/Matching Fund'], 
    required: true 
  },
  costCenter: { type: String, required: true },
  programProjectCode: { type: String },
  businessUnit: { type: String },
  function: { type: String },
  fund: { type: String },
  region: { type: String },
  
  // Expense Items
  items: [expenseItemSchema],
  
  // Totals
  totalAmount: { type: Number, default: 0 },
  universityCardAmount: { type: Number, default: 0 },
  personalAmount: { type: Number, default: 0 },
  nonReimbursableAmount: { type: Number, default: 0 },
  netReimbursement: { type: Number, default: 0 },
  
  // Status and Approvals
  status: { 
    type: String, 
    enum: ['Draft', 'Submitted', 'Faculty Approved', 'Audit Approved', 'Finance Approved', 'Completed', 'Rejected'], 
    default: 'Draft' 
  },
  facultyApproval: { approved: Boolean, date: Date, remarks: String },
  auditApproval: { approved: Boolean, date: Date, remarks: String },
  financeApproval: { approved: Boolean, date: Date, remarks: String },
  
  submissionDate: { type: Date }
}, { timestamps: true });



export default mongoose.model('ExpenseReport', expenseReportSchema);