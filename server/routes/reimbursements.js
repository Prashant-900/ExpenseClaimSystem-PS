import express from 'express';
import { createReimbursement, getReimbursements, updateReimbursementStatus } from '../controllers/reimbursementCtrl.js';
import { authenticate, authorize } from '../utils/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('Employee'), createReimbursement);
router.get('/', getReimbursements);
router.patch('/:id/status', authorize('Manager', 'Finance'), updateReimbursementStatus);

export default router;