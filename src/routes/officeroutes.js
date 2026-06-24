import express from 'express';
import * as offCtrl from '../controllers/office.js'

const router = express.Router();

router.get('/off',offCtrl.getOff);
router.post('/createoff', offCtrl.createOff)

export default router;