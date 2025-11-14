import express from 'express';
import { 
  createExpenseReport, 
  getExpenseReports, 
  getExpenseReportById, 
  updateExpenseReport, 
  submitExpenseReport,
  addExpenseItem,
  updateExpenseItem,
  deleteExpenseItem,
  deleteExpenseReport,
  approveExpenseReport
} from '../controllers/expenseReportController.js';
import { authenticate, authorize } from '../utils/authorizationMiddleware.js';
import upload from '../middleware/fileUploadMiddleware.js';

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authenticate);

router.post('/', authorize('Faculty', 'Student'), createExpenseReport);
router.get('/', getExpenseReports);
router.get('/:id', getExpenseReportById);
router.put('/:id', authorize('Faculty', 'Student'), updateExpenseReport);
router.patch('/:id', authorize('Faculty', 'Student'), updateExpenseReport);
router.delete('/:id', authorize('Faculty', 'Student'), deleteExpenseReport);
router.patch('/:id/submit', authorize('Faculty', 'Student'), submitExpenseReport);

router.post('/:id/items', authorize('Faculty', 'Student'), upload.single('receipt'), addExpenseItem);
router.put('/:id/items/:itemId', authorize('Faculty', 'Student'), updateExpenseItem);
router.delete('/:id/items/:itemId', authorize('Faculty', 'Student'), deleteExpenseItem);
router.patch('/:id/approve', authorize('Faculty', 'School Chair', 'Dean SRIC', 'Director', 'Audit', 'Finance'), approveExpenseReport);

export default router;