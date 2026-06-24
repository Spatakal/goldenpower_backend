import express from 'express';
import * as signCtrl from '../controllers/login.js';

const router = express.Router();

router.post('/sign',signCtrl.Login);

export default router;