import express from 'express'
import * as custCtrl from '../controllers/customer.js';

const router = express.Router();

router.get('/info',custCtrl.getCust);
router.get('/summary',custCtrl.getCustSummary);
router.get('/lead',custCtrl.getCustLead);

export default router;