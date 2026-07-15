import express from 'express';
import * as attenCtrl from "../controllers/attendanceController.js";
import { verifyToken } from "../middlewares/verify.js";
import { adminOnly } from "../middlewares/verify.js";

const router = express.Router();

router.get("/atten", verifyToken, attenCtrl.attendance);
router.get("/monthatten", verifyToken, attenCtrl.attendanceByMonth);
router.post("/atten", verifyToken,adminOnly, attenCtrl.attendance);


export default router;