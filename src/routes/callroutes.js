import express from 'express';
import * as callCtrl from '../controllers/call.js'
import {validateMobile} from '../middlewares/validateNumber.js'

const router = express.Router();

router.get('/log',callCtrl.getLog )
router.post('/actionlog',validateMobile, callCtrl.upsertLog)

export default router;