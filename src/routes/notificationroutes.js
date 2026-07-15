import express from "express";
import * as notifyCtrl from "../controllers/notificationController.js";

const router = express.Router();

router.post("/notify", notifyCtrl.getnotify);

export default router;
