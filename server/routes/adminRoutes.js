import express from 'express';
import { getAllUsers, updateUserRole, getSystemLogs } from '../controllers/adminController.js';
import { authenticate, authorize } from '../utils/authorizationMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('Admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/logs', getSystemLogs);

export default router;