import express from 'express';
import { getService, updateLeadStatus, getServiceemp, createService} from '../controllers/alertController.js';
import  {validateMobile} from '../middlewares/validateNumber.js'

const router = express.Router();

router.get('/alert',getService);
router.get('/empalert',getServiceemp);
router.post('/createalert',validateMobile,createService)
router.put('/upalert/:id',updateLeadStatus);

export default router;