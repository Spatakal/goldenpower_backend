import express from 'express';
import * as balCtrl from '../controllers/balance.js'
import { validateMobile } from "../middlewares/validateNumber.js";
import { verifyToken } from "../middlewares/verify.js";
import { adminOnly } from "../middlewares/verify.js";

const router = express.Router();

router.get('/bal',adminOnly,balCtrl.getBal);
router.post('/createbal',validateMobile,adminOnly,balCtrl.createBal)

export default router;