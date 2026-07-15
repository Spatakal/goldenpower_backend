// leadRoutes.js
import express from 'express';
import * as leadCtrl from '../controllers/leadController.js'; // Adjust paths as necessary
import  {validateMobile} from '../middlewares/validateNumber.js'

const router = express.Router();

// GET all leads
router.get('/work', leadCtrl.getTask);
router.get('/empwork', leadCtrl.getLeademp);

// POST create a new customer and lead
router.post('/creatework',validateMobile, leadCtrl.createTask);

// PUT/PATCH update lead status
router.put('/updatework', leadCtrl.updateTaskStatus);

export default router;