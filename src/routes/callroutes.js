import express from 'express';
import * as callCtrl from '../controllers/call.js'
import {validateMobile} from '../middlewares/validateNumber.js'
import { verifyToken } from "../middlewares/verify.js";
import { adminOnly } from "../middlewares/verify.js";


const router = express.Router();

router.get('/log',callCtrl.getLog )
router.post('/actionlog',validateMobile, adminOnly,callCtrl.upsertLog)

export default router;