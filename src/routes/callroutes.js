import express from 'express';
import * as callCtrl from '../controllers/call.js'

const router = express.Router();

router.get('/log',callCtrl.getLog )
router.post('/actionlog', callCtrl.upsertLog)

export default router;