import express from 'express';
import { getDashboardStats } from '../controllers/dashboardcontroller.js';

const router = express.Router();

// GET method for Dashboard Statistics
router.get('/admin-summary', getDashboardStats);

export default router;
