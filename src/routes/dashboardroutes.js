import express from "express";
import { getDashboard, getEmpDashboard} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/dashboard", getDashboard);
router.get("/empdashboard", getEmpDashboard);

export default router;
