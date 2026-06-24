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

const router = express.Router();

router.use('/users', userRoute);
router.use('/calls', logRoute);
router.use('/products', prdRoute);
router.use('/sales', salRoute);
router.use('/services', serRoute);
router.use('/inventory', invRoute);
router.use('/office', offRoute);
router.use('/balance', balRoute);
router.use('/payments', hisRoute);
router.use('/login',signRoute);

export default router;
