import express from 'express';
import * as serCtrl from '../controllers/service.js'
import { validateMobile } from "../middlewares/validateNumber.js";

const router = express.Router();

router.get('/ser',serCtrl.getSer);
router.post('/createser',validateMobile, serCtrl.createSer)

export default router;