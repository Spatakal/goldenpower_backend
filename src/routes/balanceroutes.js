import express from 'express';
import * as balCtrl from '../controllers/balance.js'
import { validateMobile } from "../middlewares/validateNumber.js";

const router = express.Router();

router.get('/bal',balCtrl.getBal);
router.post('/createbal',validateMobile, balCtrl.createBal)

export default router;