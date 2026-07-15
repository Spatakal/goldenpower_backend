import supabase from "../config/supabaseclient.js";
import { messaging } from "../config/firebaseconfig.js";

export const checkAndSendDueAlerts = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Starting automated service alert check...`);

    // 1️⃣ Fetch all service alerts where status is 'due_soon'
    // We can use Supabase's inner join syntax to fetch lead and customer details in a single query
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

    // 2️⃣ Fetch all active FCM tokens belonging strictly to admins
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

    // Extract raw tokens into an array
    const adminTokens = adminSessions.map(session => session.fcm_token);

    // 3️⃣ Loop through each alert and send to all admins
    let notificationsSent = 0;

    for (const alert of alerts) {
      const customer = alert.lead?.customer;
      if (!customer) continue; // Skip if database data is fragmented

      // Build the payload
      const notificationPayload = {
        notification: {
          title: "🚨 Due Soon: Service Alert Reminder",
          body: `Customer: ${customer.name} | Phone: ${customer.number}\nAddress: ${customer.address}\nDate: ${alert.alert_date}`
        }
      };

      // Send to all active admin devices using sendEachForMulticast
      const response = await messaging.sendEachForMulticast({
        tokens: adminTokens,
        notification: notificationPayload.notification
      });

      notificationsSent += response.successCount;
      console.log(`Sent alert for Lead ID ${alert.lead_id}. Success: ${response.successCount}, Failure: ${response.failureCount}`);
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

// Keep this wrapper if you still want an manual endpoint to test it via Postman
export const triggerManualCheck = async (req, res) => {
  const result = await checkAndSendDueAlerts();
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(500).json(result);
  }
};