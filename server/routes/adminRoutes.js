import express from 'express';
import { 
  getAllUsers, 
  updateUserRole, 
  getSystemLogs,
  getSchoolAdmins,
  assignSchoolChair,
  assignDeanSRIC,
  assignDirector
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../utils/authorizationMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('Admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/logs', getSystemLogs);

// School administration management
router.get('/school-admins', getSchoolAdmins);
router.post('/school-admins/chair', assignSchoolChair);
router.post('/school-admins/dean-sric', assignDeanSRIC);
router.post('/school-admins/director', assignDirector);

export default router;