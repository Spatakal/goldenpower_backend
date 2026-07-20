import express from 'express';
import * as offCtrl from '../controllers/office.js'
import { adminOnly } from "../middlewares/verify.js";

const router = express.Router();

router.get('/off',offCtrl.getOff);
router.post('/createoff', adminOnly,offCtrl.createOff)

export default router;