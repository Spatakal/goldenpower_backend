import supabase from "../config/supabaseclient.js";

export const getDashboard = async (req, res) => {
  try {
    // Leads
    const { count: pendingCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { data: pendinglead } = await supabase
      .from("leads")
      .select(`id,work_type,status,customer:customer_id (
            id,
            name,
            number,
            address,
          status
          ),
          assigned_user:assigned_to (
            id,
            name,
            number,
            role
          )`)
      .eq("status", "pending");

    const { data: progresslead } = await supabase
      .from("leads")
      .select(`id,work_type,status,customer:customer_id (
            id,
            name,
            number,
            address,
          status
          ),
          assigned_user:assigned_to (
            id,
            name,
            number,
            role
          )`)
      .eq("status", "progress");

    // Customers
    const { count: customerCount } = await supabase
      .from("customer")
      .select("*", { count: "exact", head: true });

    // Balance
    const { data: customerBalanceRows } = await supabase
      .from("balance")
      .select("amount")
      .eq("notes", "customer_balance");

    const { data: purchaseBalanceRows } = await supabase
      .from("balance")
      .select("amount")
      .eq("notes", "purchase_balance");

    const customerBalance =
      customerBalanceRows?.reduce((sum, r) => sum + r.amount, 0) || 0;
    const purchaseBalance =
      purchaseBalanceRows?.reduce((sum, r) => sum + r.amount, 0) || 0;

    // Call logs
    const { count: followupCount } = await supabase
      .from("calllog")
      .select("*", { count: "exact", head: true })
      .eq("status", "followup");

    // Employees
    const { count: employeeCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "employee");

    // Service_alert
    const { data: servicealert, error } = await supabase
      .from("service_alert")
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
      .eq("status", "due_soon");



    // Sales + Service
    const { data: salesRows } = await supabase.from("sales").select("amount");
    const { data: serviceRows } = await supabase.from("service").select("price");

    const totalRevenue =
      (salesRows?.reduce((sum, r) => sum + r.amount, 0) || 0) +
      (serviceRows?.reduce((sum, r) => sum + r.price, 0) || 0);


    // Build summary
    const dashboardSummary = {
      leads: { pending: pendingCount, progress: progresslead, pendings: pendinglead },
      customers: customerCount,
      balance: { customer: customerBalance, purchase: purchaseBalance },
      calllogs: followupCount,
      employees: employeeCount,
      services: servicealert,
      totals: { revenue: totalRevenue }
    };

    // // Notify API (native fetch in Node.js v18+)
    // await fetch("https://thats-washing-connection-hazardous.trycloudflare.com/api/notification/notify", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(dashboardSummary)
    // });

    res.status(200).json({ success: true, dashboard: dashboardSummary });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, error: "Failed to build dashboard" });
  }
};


export const getEmpDashboard = async (req, res) => {
  try {

    // Service_alert
    const { data: servicealert, error } = await supabase
      .from("service_alert")
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
      .eq("status", "due_soon");

    // Build summary
    const empdashboardSummary = {
      services: servicealert
    };
    res.status(200).json({ success: true, dashboard: empdashboardSummary });

  } catch (err) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, error: "Failed to build dashboard" });

  }
}