import express from 'express';
import * as salCtrl from '../controllers/sales.js'
import { validateMobile } from "../middlewares/validateNumber.js";

const router = express.Router();

router.get('/sal',salCtrl.getSal);
router.post('/createsal',validateMobile, salCtrl.createSal)

export default router;