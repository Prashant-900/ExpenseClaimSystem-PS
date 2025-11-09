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
    enum: ['University Credit Card', 'Personal Funds (Reimbursement)', 'Direct Invoice to University'], 
    required: true 
  },
  receipt: { type: String },
  receiptImage: { type: String, required: true },
  businessPurpose: { type: String },
  
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
    enum: ['SCEE', 'SMME', 'SCENE', 'SBB', 'SCS', 'SMSS', 'SPS', 'SoM', 'SHSS', 'CAIR', 'IKSMHA', 'AMRC', 'CQST', 'C4DFED', 'BioX Centre']
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
  
  // Fund Type and Project Information (set by faculty for student submissions)
  fundType: {
    type: String,
    enum: ['Institute Fund', 'Department/School Fund', 'Project Fund', 'Professional Development Allowance']
  },
  projectId: { type: String }, // Required when fundType is 'Project Fund'
  
  // Expense Summary
  fundingSource: { 
    type: String, 
    enum: ['Department Budget', 'Research Grant', 'Gift/Endowment Fund', 'Cost-Sharing/Matching Fund'], 
    required: true 
  },
  costCenter: { type: String },
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
    enum: ['Draft', 'Submitted', 'Faculty Approved', 'School Chair Approved', 'Dean SRIC Approved', 'Director Approved', 'Audit Approved', 'Finance Approved', 'Completed', 'Rejected'], 
    default: 'Draft' 
  },
  facultyApproval: { approved: Boolean, date: Date, remarks: String, approvedBy: String, approvedById: mongoose.Schema.Types.ObjectId },
  schoolChairApproval: { approved: Boolean, date: Date, remarks: String, approvedBy: String, approvedById: mongoose.Schema.Types.ObjectId, action: String },
  deanSRICApproval: { approved: Boolean, date: Date, remarks: String, approvedBy: String, approvedById: mongoose.Schema.Types.ObjectId, action: String },
  directorApproval: { approved: Boolean, date: Date, remarks: String, approvedBy: String, approvedById: mongoose.Schema.Types.ObjectId, action: String },
  auditApproval: { approved: Boolean, date: Date, remarks: String, approvedBy: String, approvedById: mongoose.Schema.Types.ObjectId, action: String },
  financeApproval: { approved: Boolean, date: Date, remarks: String, approvedBy: String, approvedById: mongoose.Schema.Types.ObjectId, action: String },
  
  // Unified approval history (new). Each entry captures the stage and metadata.
  approvalHistory: [{
    stage: { type: String, enum: ['Faculty', 'School Chair', 'Dean SRIC', 'Director', 'Audit', 'Finance'] },
    approved: Boolean,
    date: Date,
    remarks: String,
    action: String, // e.g., 'sendback'
    approvedBy: String,
    approvedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  submissionDate: { type: Date }
}, { timestamps: true });



export default mongoose.model('ExpenseReport', expenseReportSchema);