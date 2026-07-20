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
      id),
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
      id),
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

export const createService = async (req, res) => {
  try {
    const { alert_date, months_interval, name, number, address } = req.body;

    const normalizedNumber = req.number || number;

    // 1. Initial validation
    if (!name || !address) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // This variable will hold the ID we link the service_alert to
    let targetCustomerId = null;

    // 2. CHECK CUSTOMER TABLE FIRST
    const { data: existingCustomer, error: custCheckError } = await supabase
      .from("customer")
      .select("*")
      .eq("number", normalizedNumber)
      .maybeSingle();

    if (custCheckError) {
      return res.status(400).json({ success: false, message: custCheckError.message });
    }

    if (existingCustomer) {
      targetCustomerId = existingCustomer.id;

      // If req.body has address, update the customer record
      if (req.body.address) {
        const { error: updateError } = await supabase
          .from("customer")
          .update({ address: req.body.address })
          .eq("id", targetCustomerId);

        if (updateError) {
          return res.status(400).json({ success: false, message: updateError.message });
        }
      }
    } else {
      // 3. FALLBACK: CHECK CALLLOG TABLE IF NOT A CUSTOMER
      const { data: existingCallLog, error: callLogCheckError } = await supabase
        .from("calllog")
        .select("*")
        .eq("number", normalizedNumber)
        .maybeSingle();

      if (callLogCheckError) {
        return res.status(400).json({ success: false, message: callLogCheckError.message });
      }

      // 4. Create new customer because they don't exist anywhere yet
      const { data: newCustomer, error: custError } = await supabase
        .from("customer")
        .insert([{ name, number: normalizedNumber, address, status: "Fresh" }])
        .select()
        .single();

      if (custError) {
        return res.status(400).json({ success: false, message: custError.message });
      }

      targetCustomerId = newCustomer.id;
    }

    // -------------------------------
    // SERVICE ALERT CREATION LOGIC
    // -------------------------------
    // const LeadId = lead_id || 20; // fallback to 20 if not provided
    const status = "active";

    let finalAlertDate;
    if (months_interval) {
      const today = new Date();
      today.setMonth(today.getMonth() + months_interval);
      finalAlertDate = today.toISOString().split("T")[0];
    } else if (alert_date) {
      finalAlertDate = alert_date;
    } else {
      finalAlertDate = new Date().toISOString().split("T")[0];
    }

    const { data, error } = await supabase
      .from("service_alert")
      .insert([
        {
          lead_id: null,
          customer_id: targetCustomerId, // <-- new column linkage
          alert_date: finalAlertDate,
          months_interval: months_interval || null,
          status,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({
      success: true,
      message: "Service alert created successfully",
      alert: data,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
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
