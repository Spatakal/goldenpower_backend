import express from 'express';
import * as userCtrl from '../controllers/user.js';

const router = express.Router();

router.get('/user',userCtrl.getUsers);
router.post('/create', userCtrl.createUsers)

export default router;