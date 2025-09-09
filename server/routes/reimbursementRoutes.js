import express from 'express';
import { createReimbursement, getReimbursements, updateReimbursementStatus, getStudentRequests, getFacultyOwnRequests } from '../controllers/reimbursementController.js';
import { editReimbursement } from '../controllers/reimbursementEditController.js';
import { authenticate, authorize } from '../utils/authorizationMiddleware.js';
import upload from '../middleware/fileUploadMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('Student', 'Faculty'), upload.array('images', 5), createReimbursement);
router.get('/', getReimbursements);
router.get('/student-requests', authorize('Faculty'), getStudentRequests);
router.get('/my-requests', authorize('Faculty'), getFacultyOwnRequests);
router.patch('/:id/status', authorize('Faculty', 'Audit', 'Finance'), updateReimbursementStatus);
router.put('/:id', authorize('Student', 'Faculty'), upload.array('images', 5), editReimbursement);

export default router;