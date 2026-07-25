import express from "express";
import { notify } from "../controllers/notificationController.js";

const router = express.Router();

// Route: /api/notification/notify
router.all("/notify", notify);

export default router;