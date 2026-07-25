import supabase from "../config/supabaseclient.js";
import { messaging } from "../config/firebaseconfig.js";

export const checkAndSendDueAlerts = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Starting automated service alert check...`);

    // 1️⃣ Fetch all service alerts where status is 'due_soon'
    const { data: alerts, error: alertError } = await supabase
      .from("service_alert")
      .select(`
        alert_date,
        status,
        lead_id,
        lead:lead_id (
          customer:customer_id (
            name,
            number,
            address
          )
        )
      `)
      .eq("status", "due_soon");

    if (alertError) throw alertError;

    if (!alerts || alerts.length === 0) {
      console.log("No 'due_soon' service alerts found.");
      return { success: true, message: "No pending alerts." };
    }

    // 2️⃣ Fetch active FCM tokens belonging strictly to admins
    const { data: adminSessions, error: sessionError } = await supabase
      .from("sessions")
      .select("fcm_token")
      .eq("role", "admin")
      .not("fcm_token", "is", null);

    if (sessionError) throw sessionError;

    if (!adminSessions || adminSessions.length === 0) {
      console.log("No active admin FCM tokens found in sessions.");
      return { success: false, message: "No admin tokens available." };
    }

    const adminTokens = adminSessions.map((session) => session.fcm_token);
    let notificationsSent = 0;

    // 3️⃣ Loop through alerts and push via Firebase
    for (const alert of alerts) {
      const customer = alert.lead?.customer;
      if (!customer) continue;

      const notificationPayload = {
        notification: {
          title: "🚨 Due Soon: Service Alert Reminder",
          body: `Customer: ${customer.name} | Phone: ${customer.number}\nAddress: ${customer.address}\nDate: ${alert.alert_date}`
        }
      };

      const response = await messaging.sendEachForMulticast({
        tokens: adminTokens,
        notification: notificationPayload.notification
      });

      notificationsSent += response.successCount;
      console.log(
        `Sent alert for Lead ID ${alert.lead_id}. Success: ${response.successCount}, Failure: ${response.failureCount}`
      );
    }

    return {
      success: true,
      alertsProcessed: alerts.length,
      notificationsDispatched: notificationsSent
    };

  } catch (err) {
    console.error("Automated notification error:", err.message);
    return { success: false, error: err.message };
  }
};

// Wrapper function to expose as an API endpoint handler
export const notify = async (req, res) => {
  // Security Key Check
  const clientKey = req.headers["x-cron-secret"] || req.query.secret;
  const secretKey = process.env.CRON_SECRET || "your_fallback_secret_key";

  if (clientKey !== secretKey) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid Cron Secret Key"
    });
  }

  const result = await checkAndSendDueAlerts();

  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(500).json(result);
  }
};