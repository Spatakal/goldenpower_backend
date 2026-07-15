import express from 'express';
import { getService, updateLeadStatus, getServiceemp } from '../controllers/alertController.js';

const router = express.Router();

router.get('/alert',getService);
router.get('/empalert',getServiceemp);
router.put('/upalert/:id',updateLeadStatus);

export default router;