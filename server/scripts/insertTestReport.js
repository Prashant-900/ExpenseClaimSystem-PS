import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExpenseReport from '../models/ExpenseReport.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const testReport = {
      submitterId: new mongoose.Types.ObjectId(),
      submitterRole: 'Student',
      facultyId: new mongoose.Types.ObjectId(),
      facultyName: 'Test Faculty',
      studentId: 'stu123',
      studentName: 'Test Student',
      department: 'SCEE',
      expensePeriodStart: new Date(),
      expensePeriodEnd: new Date(),
      purposeOfExpense: 'Testing faculty selection',
      reportType: 'Teaching-related',
      fundingSource: 'Department Budget',
      costCenter: 'CC-001',
      items: [
        {
          date: new Date(),
          category: 'Meals - Lunch',
          description: 'Test meal',
          amount: 100,
          currency: 'INR',
          amountInINR: 100,
          paymentMethod: 'Personal Funds (Reimbursement)',
          receiptImage: 'dummy.jpg',
          businessPurpose: 'Test'
        }
      ],
      totalAmount: 100,
      submissionDate: new Date()
    };

    const created = await ExpenseReport.create(testReport);
    console.log('Inserted report id:', created._id.toString());

    const fetched = await ExpenseReport.findById(created._id).lean();
    console.log('Fetched report:', {
      id: fetched._id.toString(),
      facultyId: fetched.facultyId,
      facultyName: fetched.facultyName,
      studentName: fetched.studentName
    });

    // Clean up
    await ExpenseReport.findByIdAndDelete(created._id);
    console.log('Cleaned up test report');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Test script error:', error);
    process.exit(1);
  }
};

run();
