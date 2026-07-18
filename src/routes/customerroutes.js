import express from 'express'
import * as custCtrl from '../controllers/customer.js';

const router = express.Router();

router.get('/info',custCtrl.getCust);
router.post('/create',custCtrl.createCust);
router.put('/update',custCtrl.updateCustStatus);
router.get('/summary',custCtrl.getCustSummary);
router.get('/lead',custCtrl.getCustLead);

export default router;