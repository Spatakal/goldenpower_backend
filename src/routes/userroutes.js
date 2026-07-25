import express from 'express';
import * as userCtrl from '../controllers/user.js';
import { verifyToken } from "../middlewares/verify.js";
import { validateMobile } from "../middlewares/validateNumber.js";

const router = express.Router();

router.get('/user',verifyToken,userCtrl.getUsers);
router.post('/create',validateMobile , userCtrl.createUsers)

export default router;