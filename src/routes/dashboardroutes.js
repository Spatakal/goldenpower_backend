<<<<<<< HEAD
import express from 'express';
import { getDashboardStats } from '../controllers/dashboardcontroller.js';

const router = express.Router();

// GET method for Dashboard Statistics
router.get('/admin-summary', getDashboardStats);
=======
import express from "express";
import { getDashboard, getEmpDashboard} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/dashboard", getDashboard);
router.get("/empdashboard", getEmpDashboard);
>>>>>>> bf4eeb2 (files are safe)

export default router;
