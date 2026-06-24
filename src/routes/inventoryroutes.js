import express from 'express';
import * as stkCtrl from '../controllers/inventory.js'

const router = express.Router();

router.get('/stk',stkCtrl.getStk);
router.post('/createstk', stkCtrl.createStk)

export default router