import express from 'express';
import { 
  getAllUsers, 
  updateUserRole,
  deleteUser,
  getSystemLogs,
  getSchoolAdmins,
  assignSchoolChair,
  assignDeanSRIC,
  assignDirector
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../utils/authorizationMiddleware.js';

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authenticate);
router.use(authorize('Admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/logs', getSystemLogs);

// School administration management
router.get('/school-admins', getSchoolAdmins);
router.post('/school-admins/chair', assignSchoolChair);
router.post('/school-admins/dean-sric', assignDeanSRIC);
router.post('/school-admins/director', assignDirector);

export default router;