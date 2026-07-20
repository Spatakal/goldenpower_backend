import express from 'express'
import * as custCtrl from '../controllers/customer.js';
import { verifyToken } from "../middlewares/verify.js";
import { adminOnly } from "../middlewares/verify.js";

const router = express.Router();

router.get('/info', adminOnly,custCtrl.getCust);
router.post('/create', adminOnly,custCtrl.createCust);
router.put('/update', adminOnly,custCtrl.updateCustStatus);
router.get('/summary', adminOnly,custCtrl.getCustSummary);
router.get('/lead', adminOnly,custCtrl.getCustLead);

export default router;