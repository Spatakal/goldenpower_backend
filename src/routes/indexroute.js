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
import dashboardRoutes from './dashboardroutes.js';
import attendanceRoutes from "./attendanceroutes.js";
import leadRoute from "./leadroutes.js";
import customerRoute from './customerroutes.js';
// import notificationRoute from './notificationroutes.js';
import alertRoute from './alertroutes.js'
import { verifyToken } from "../middlewares/verify.js";
import { adminOnly } from "../middlewares/verify.js";
import { validateMobile } from "../middlewares/validateNumber.js";
import {tokenValid} from '../routes/tokenroutes.js'

const router = express.Router();

// verifyToken, adminOnly, validateMobile
router.use('/users',verifyToken,adminOnly,userRoute);
router.use('/calls',verifyToken,adminOnly,logRoute);
router.use('/products',verifyToken,adminOnly,prdRoute);
router.use('/sales',verifyToken,adminOnly,salRoute);
router.use('/services',verifyToken,adminOnly,serRoute);
router.use('/inventory', verifyToken,adminOnly,invRoute);
router.use('/office',verifyToken,offRoute);
router.use('/balance',verifyToken,adminOnly,balRoute);
router.use('/payments',verifyToken,adminOnly,hisRoute);
router.use('/customer',verifyToken,adminOnly,customerRoute);
// router.use('/notification',notificationRoute);
router.use('/alert',verifyToken,alertRoute);
router.use('/login',validateMobile,signRoute);
router.use("/stats", verifyToken,adminOnly,attendanceRoutes);
router.use('/dashboard', verifyToken,adminOnly,dashboardRoutes);
router.use('/lead',verifyToken,leadRoute);
router.get("/valid",tokenValid);

export default router;
