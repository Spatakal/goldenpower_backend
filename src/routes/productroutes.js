import express from 'express';
import * as prdCtrl from '../controllers/product.js'

const router = express.Router();

router.get('/prd', prdCtrl.getPrd);
router.post('/createprd',  prdCtrl.createPrd)

export default router;
