import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Basic expense details
  title: { type: String, required: true },
  expenseType: { type: String, enum: [
    'Travel – Airfare', 'Travel – Accommodation', 'Travel – Meals & Per Diem',
    'Local Transportation (Taxi, Ride-share, Mileage)', 'Conference Fees',
    'Research Equipment/Supplies', 'Lab Consumables', 'Books/Subscriptions/Software',
    'Student Activity Support', 'Guest Lecturer Honorarium', 'Office Supplies', 'Miscellaneous / Other'
  ], required: true },
  expenseDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  receipt: { type: String },
  images: [{ type: String }],
  country: { type: String, default: 'IN' },
  
  // Travel specific fields
  originState: { type: String },
  originCity: { type: String },
  destinationState: { type: String },
  destinationCity: { type: String },
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
  accommodationState: { type: String },
  accommodationCity: { type: String },
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
  
  // Faculty email for students
  facultyEmail: { type: String },
  
  status: { type: String, enum: ['Draft'], default: 'Draft' }
}, { timestamps: true });

export default mongoose.model('Draft', draftSchema);