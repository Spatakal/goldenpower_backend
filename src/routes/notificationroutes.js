import express from "express";
import { notify } from "../controllers/notificationController";

const router = express.Router();

// Route: /api/notification/notify
router.all("/notify", notify);

export default router;