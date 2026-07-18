import supabase from "../config/supabaseclient.js";

export const getService = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('service_alert')
      .select(`
    id,
    status,
    alert_date,
    lead:lead_id (
      id,
      customer:customer_id (
        id,
        name,
        number,
        address,
          status
      )
    )
  `)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400)
        .json({
          success: false,
          code: error.code,
          message: error.message,
          detail: error.detail
        });
    }
    return res.status(200)
      .json({
        success: true,
        data
      });
  } catch (err) {
    return res.status(500)
      .json({
        message: "server error",
        detail: err.detail
      });
  }
}

export const getServiceemp = async (req, res) => {
  try {

    const { data, error } = await supabase
      .from('service_alert')
      .select(`
    id,
    status,
    alert_date,
    lead:lead_id (
      id,
      customer:customer_id (
        id,
        name,
        number,
        address,
          status
      )
    )
  `)
      .neq("status", "closed")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400)
        .json({
          success: false,
          code: error.code,
          message: error.message,
          detail: error.detail
        });
    }
    return res.status(200)
      .json({
        success: true,
        data
      });
  } catch (err) {
    return res.status(500)
      .json({
        message: "server error",
        detail: err.detail
      });
  }
}

export const creteService = async (req, res) => {
  try {
    const { lead_id, alert_date, months_interval } = req.body;

    const LeadId = 20;
    const status = "active";

    let finalAlertDate;

    if (months_interval) {
      const today = new Date();
      today.setMonth(today.getMonth() + months_interval);
      finalAlertDate = today.toISOString().split("T")[0]; // format YYYY-MM-DD
    } else if (alert_date) {
      finalAlertDate = alert_date;
    } else {
      // If neither is provided, fallback to today's date
      finalAlertDate = new Date().toISOString().split("T")[0];
    }

    // Example insertion into Supabase (adjust table name/columns as needed)
    const { data, error } = await supabase
      .from("service_alert")
      .insert([
        {
          lead_id: LeadId,
          alert_date: finalAlertDate,
          months_interval: months_interval || null,
          status,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service alert created successfully",
      alert: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;   // lead id from URL
    const { status } = req.body; // fields from body

    // Basic validation
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing lead id or status"
      });
    }

    // Update logic
    const { data, error } = await supabase
      .from("service_alert")
      .update({
        status
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        code: error.code,
        message: error.message,
        detail: error.details
      });
    }

    return res.status(200).json({
      success: true,
      message: "status updated",
      lead: data
    });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};
