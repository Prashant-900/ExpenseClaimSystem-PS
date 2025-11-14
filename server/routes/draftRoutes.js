import express from 'express';
import { createDraft, getDrafts, getDraftById, updateDraft, deleteDraft } from '../controllers/draftController.js';
import { authenticate, authorize } from '../utils/authorizationMiddleware.js';
import upload from '../middleware/fileUploadMiddleware.js';

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authenticate);

router.post('/', authorize('Student', 'Faculty'), upload.array('images', 5), createDraft);
router.get('/', authorize('Student', 'Faculty'), getDrafts);
router.get('/:id', authorize('Student', 'Faculty'), getDraftById);
router.put('/:id', authorize('Student', 'Faculty'), upload.array('images', 5), updateDraft);
router.delete('/:id', authorize('Student', 'Faculty'), deleteDraft);

export default router;