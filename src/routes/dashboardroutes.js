import express from "express";
import { getDashboard, getEmpDashboard} from "../controllers/dashboardcontroller.js";
import { verifyToken } from "../middlewares/verify.js";
import { adminOnly } from "../middlewares/verify.js";

const router = express.Router();

router.get("/dashboard",adminOnly, getDashboard);
router.get("/empdashboard",getEmpDashboard);

export default router;
