import express from 'express';
import * as balCtrl from '../controllers/balance.js'

const router = express.Router();

router.get('/bal',balCtrl.getBal);
router.post('/createbal', balCtrl.createBal)

export default router;