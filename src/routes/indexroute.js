import express from 'express';
import userRoute from './userroutes.js';
import logRoute from './callroutes.js';
import balRoute from './balanceroutes.js';
import invRoute from './inventoryroutes.js';
import offRoute from './officeroutes.js';
import hisRoute from './payment_historyroutes.js';
import prdRoute from './productroutes.js';
import salRoute from './salesroutes.js';
import serRoute from './serviceroutes.js';
import signRoute from './loginroutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import {attendanceSummary} from "../controllers/attendanceController.js";
import { verifyToken } from "../middlewares/verify.js";
import { adminOnly } from "../middlewares/verify.js";

const router = express.Router();

router.use('/users',verifyToken, adminOnly,userRoute);
router.use('/calls', verifyToken, adminOnly,logRoute);
router.use('/products', verifyToken,prdRoute);
router.use('/sales',verifyToken, adminOnly,salRoute);
router.use('/services',verifyToken, serRoute);
router.use('/inventory',verifyToken, invRoute);
router.use('/office',verifyToken, offRoute);
router.use('/balance',verifyToken,  adminOnly,balRoute);
router.use('/payments',verifyToken, adminOnly,hisRoute);
router.use('/login',signRoute);
router.get("/attendance", verifyToken, attendanceSummary);
router.use('/dashboard', dashboardRoutes);

export default router;
