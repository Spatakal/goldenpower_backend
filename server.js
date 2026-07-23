import '@dotenvx/dotenvx/config'
import express from 'express';
import cors from 'cors';
import apiRoute from './src/routes/indexroute.js';
import requestLogger from './src/middlewares/logger.js';
import errorLogger from './src/middlewares/errorlogger.js';
import supabase from './src/config/supabaseclient.js';
import cron from "node-cron";
import { checkAndSendDueAlerts } from "./src/controllers/notificationController.js"; // Adjust path as needed

const app = express();
const port = process.env.PORT;
const port_1 = process.env.PORT_1;

app.use(express.json());
app.use(cors());
app.use(requestLogger);

app.use('/api', apiRoute);
//ROUTE
app.get('/', (req, res) => {
    res.send('Welcome to Golden Power Battery API');
});

// Schedule configuration: 'minute hour day-of-month month day-of-week'
// 0 9,13,18 * * * means: Minute 0 of Hours 9, 13 (1 PM), and 18 (6 PM) everyday.
cron.schedule("21 9,13,18,17 * * *", async () => {
  console.log("Running scheduled service alert check...");
  await checkAndSendDueAlerts();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // Sets execution context to your local time zone
});

cron.schedule("45 22 * * *", async () => {
  const { error } = await supabase
    .from("sessions")
    .delete()
    .not("token_hash", "is", null); 
    // deletes only rows where token_hash is NOT null

  if (error) {
    console.error("Failed to delete sessions:", error.message);
  } else {
    console.log("Sessions with token_hash cleared");
  }
});

cron.schedule("19 23 * * *", async () => {
  const { error } = await supabase
    .from("service_alert")
    .update({ status: "due_soon" })
    .eq("status", "active")
    .eq("alert_date", new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

  if (error) {
    console.error("Cronjob failed (status):", error.message);
  } else {
    console.log("Service alerts updated for upcoming alerts.");
  }
});

app.use(errorLogger);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.listen(port_1, () => {
    console.log(`Server is running on port ${port}`);
});
