import express from 'express';
import * as salCtrl from '../controllers/sales.js'

const router = express.Router();

router.get('/sal',salCtrl.getSal);
router.post('/createsal', salCtrl.createSal)

export default router;