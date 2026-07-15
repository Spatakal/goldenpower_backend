import supabase from "../config/supabaseclient.js";

export const getCust = async (req, res) => {
    try {
        const {data, count, error} =await supabase
        .from("customer")
        .select("*", { count: "exact" })

        .order("created_at", {ascending:false} );

        if(error){
            return res.status(400).json({
                success:false,
                message:error.message
            });

        }
            return res.status(200).json({
            success:true,
            data,
            count
            });
    } catch (err) {
        return res.status(500).json({ 
      success: false, 
      message: err.message
    });
    }
};


export const getCustSummary = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("customer")
      .select(`
        id,
        name,
        number,
        address,
        leads (
          id,
          status,
          service_alert (
            id,
            status
          )
        )
      `);

    if (error) throw error;

    const summary = data.map(cust => {
      const doneLeads = cust.leads.filter(l => l.status === 'done').length;

      const services = cust.leads.flatMap(l => l.service_alert ? [l.service_alert] : []);
      const activeServices = services.filter(s => s.status === 'active').length;
      const closedServices = services.filter(s => s.status === 'closed').length;

      return {
        customerId: cust.id,
        name: cust.name,
        number: cust.number,
        address: cust.address,
        doneLeads,
        activeServices,
        closedServices
      };
    });

    return res.status(200).json({ success: true, summary });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const getCustLead = async (req, res) => {
  try {
    const { customerId } = req.query;

    let query = supabase
      .from("customer_lead_service")
      .select(`
        id,
        customer:customer_id (
          id, name, number, address
        ),
        lead:lead_id (
          id, work_type, status,
          users:assigned_to (
            id, name, number, role
          ),
          lead_items (
            id, qty,
            product:product_id (
              id, product_name, brand_name
            )
          )
        ),
        service_alert:service_alert_id (
          id, status, months_interval, alert_date
        )
      `);

    if (customerId) {
      query = query.eq("customer_id", customerId);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

if (!data || data.length === 0) {
  const { data: custData, error: custError } = await supabase
    .from("customer")
    .select("id, name, number, address")
    .eq("id", customerId)
    .maybeSingle();

  if (custError) {
    return res.status(400).json({ success: false, message: custError.message });
  }

  if (!custData) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }

  // ✅ No record at all → return customer skeleton with no leads
  return res.status(200).json({
    success: true,
    data: [
      {
        customer: custData,
        leads: []
      }
    ]
  });
}
    // ✅ Group by customer
    const grouped = {};
    data.forEach(row => {
      const custId = row.customer.id;
      if (!grouped[custId]) {
        grouped[custId] = {
          customer: row.customer,
          leads: []
        };
      }
      grouped[custId].leads.push({
        ...row.lead,
        service_alert: row.service_alert
      });
    });

    const result = Object.values(grouped);

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
