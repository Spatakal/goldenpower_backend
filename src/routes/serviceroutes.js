import express from 'express';
import * as serCtrl from '../controllers/service.js'

const router = express.Router();

router.get('/ser',serCtrl.getSer);
router.post('/createser', serCtrl.createSer)

export default router;