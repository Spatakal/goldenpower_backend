<<<<<<< HEAD
import supabase from '../config/supabaseclient.js';

export const getDashboardStats = async (req, res) => {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear(); // 2026
        const currentMonth = currentDate.getMonth() + 1; 

        const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01T00:00:00.000Z`;
        const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999).toISOString();

        // Promise.all call concurrently reads all tables (including the new calllog table)
        const [
            usersCountRes,
            recentUsersRes,
            salesRes,
            serviceRes,
            balanceRes,
            callLogRes // <-- Added calllog metric reference
        ] = await Promise.all([
            // 1. Total users list count
            supabase.from('users').select('*', { count: 'exact', head: true }),
            
            // 2. Top 5 recent users
            supabase.from('users').select('id, name, number, created_at').order('created_at', { ascending: false }).limit(5),
            
            // 3. Sales metrics current month data
            supabase.from('sales').select('amount, created_at').gte('created_at', startOfMonth).lte('created_at', endOfMonth),
            
            // 4. Service walkins current month data
            supabase.from('service').select('price, created_at').gte('created_at', startOfMonth).lte('created_at', endOfMonth),
            
            // 5. Balance table - Direct flat query
            supabase.from('balance').select('amount, status'),

            // 6. Call logs status query - Direct flat query for aggregated metrics
            supabase.from('calllog').select('status')
        ]);

        // Error checking blocks
        if (usersCountRes.error) return res.status(400).json({ error: usersCountRes.error.message });
        if (recentUsersRes.error) return res.status(400).json({ error: recentUsersRes.error.message });
        if (salesRes.error) return res.status(400).json({ error: salesRes.error.message });
        if (serviceRes.error) return res.status(400).json({ error: serviceRes.error.message });
        if (balanceRes.error) return res.status(400).json({ error: balanceRes.error.message });
        if (callLogRes.error) return res.status(400).json({ error: callLogRes.error.message });

        // --- PROCESSING FINANCIAL SALES REVENUE ---
        let totalSalesBillsCount = salesRes.data.length;
        let totalMonthlySalesAmount = 0;

        salesRes.data.forEach(sale => {
            totalMonthlySalesAmount += Number(sale.amount || 0);
        });

        // --- PROCESSING SERVICE REVENUE ---
        let totalServiceWalkinsCount = serviceRes.data.length;
        let totalMonthlyServiceAmount = 0;

        serviceRes.data.forEach(ser => {
            totalMonthlyServiceAmount += Number(ser.price || 0);
        });

        // --- PROCESSING BALANCE RECORDS ---
        let totalBalancePendingToReceive = 0;

        balanceRes.data.forEach(bal => {
            totalBalancePendingToReceive += Number(bal.amount || 0);
        });

        // --- PROCESSING CALL LOG METRICS ---
        let totalFollowupsCount = 0;
        let totalDoneCount = 0;

        callLogRes.data.forEach(log => {
            if (log.status === 'followup') totalFollowupsCount++;
            if (log.status === 'done') totalDoneCount++;
        });

        // Dashboard net accounting calculation pipeline logic
        const netCollectedRevenueThisMonth = (totalMonthlySalesAmount + totalMonthlyServiceAmount) - totalBalancePendingToReceive;

        // Clean UI schema model output response
        res.status(200).json({
            success: true,
            status: "success",
            usersMetrics: {
                totalUsersCount: usersCountRes.count,
                recentRegisteredUsers: recentUsersRes.data
            },
            monthlySalesMetrics: {
                totalSalesBillsGenerated: totalSalesBillsCount,
                totalSalesBillValue: totalMonthlySalesAmount
            },
            monthlyServiceMetrics: {
                totalServiceWalkins: totalServiceWalkinsCount,
                totalServiceRevenue: totalMonthlyServiceAmount
            },
            balanceMetrics: {
                totalPendingBalance: totalBalancePendingToReceive
            },
            callLogMetrics: { // <-- Added to the UI schema
                totalFollowups: totalFollowupsCount,
                totalCompletedTasks: totalDoneCount
            },
            overallFinancialSummary: {
                currentMonthFilterIndex: currentMonth,
                netCollectedRevenueThisMonth: netCollectedRevenueThisMonth,
                totalBalanceReceivablePipeline: totalBalancePendingToReceive
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Internal server breakdown while extracting unified dashboard analytics layer' });
    }
};
=======
import supabase from "../config/supabaseclient.js";

export const getDashboard = async (req, res) => {
  try {
    // Leads
    const { count: pendingCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { data: progresslead } = await supabase
      .from("leads")
      .select(`id,work_type,status,customer:customer_id (
            id,
            name,
            number,
            address
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
        address
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
      leads: { pending: pendingCount, progress: progresslead },
      customers: customerCount,
      balance: { customer: customerBalance, purchase: purchaseBalance },
      calllogs: followupCount,
      employees: employeeCount,
      services:servicealert,
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


export const getEmpDashboard = async (req,res) => {
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
        address
      )
    )
  `)
  .eq("status", "due_soon");

    // Build summary
    const empdashboardSummary = {
      services:servicealert
    };
  res.status(200).json({ success: true, dashboard: empdashboardSummary });

  } catch (err) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, error: "Failed to build dashboard" });

  }
}
>>>>>>> bf4eeb2 (files are safe)
