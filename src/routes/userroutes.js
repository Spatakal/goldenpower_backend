import express from 'express';
import * as userCtrl from '../controllers/user.js';
import { verifyToken } from "../middlewares/verify.js";

const router = express.Router();

router.get('/user',verifyToken,userCtrl.getUsers);
router.post('/create', userCtrl.createUsers)

export default router;