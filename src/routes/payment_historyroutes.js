import express from 'express';
import * as hisCtrl from '../controllers/payment_history.js'

const router = express.Router();

router.get('/his', hisCtrl.getHis);
router.post('/createhis', hisCtrl.createHis)

export default router;