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