// customerLeads.js
import supabase from '../config/supabaseclient.js';

 /**
 * Get all leads with full details, including multi-product items
 */

export const getTask = async (req, res) => {
  try {
    const { id } = req.query; 

    let query = supabase.from("leads");

    if (id) {
      // Fetch single lead with full details
      const { data, error } = await query
        .select(`
          id,
          work_type,
          status,
          notes,
          created_at,
          customer:customer_id (
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
          ),
          lead_items (
            id,
            qty,
            product:product_id (
              id,
              product_name,
              brand_name
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(200).json({
        success: true,
        lead: data
      });
    } else {
      // Fetch all leads (list view)
      const { data, error } = await query
        .select(`
          id,
          work_type,
          status,
          notes,
          created_at,
          customer:customer_id (
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
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(200).json({
        success: true,
        leads: data
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getLeademp = async (req, res)=> {
    try {
const { data, error } = await supabase 
  .from('leads')
  .select(`
          id,
          work_type,
          status,
          notes,
          created_at,
          customer:customer_id (
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
          )
        `)
  .neq('status', 'done'); 

 if(error) {
         return res.status(400)
        .json({
               sucess:false,
               code:error.code,
               message:error.message,
               detail:error.details
              });
            }
        res.status(200) .json({message:data})
    } catch (error) {
        res.status(500).json({
            error:"failed internal server"
        });
    }
}

/**
 * Create a new task
 * - customer → name, number, address
 * - lead → workType, status
 * - lead_items → multiple products (product_id, qty)
 */
export const createTask = async (req, res) => {
  try {
    const { name, number, address, workType, products, assignedTo,notes } = req.body;
    const normalizedNumber = req.number || number; 
    
    // 1. Initial validation
    if (!name || !address || !workType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // This variable will hold the ID we link the lead to
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

  // 2. If req.body has address, update the customer record
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

      if (callLogCheckError) return res.status(400).json({ success: false, message: callLogCheckError.message });

      // Note: If you want to convert a calllog lead into a customer, we proceed to create them below.
      // If you intended to completely stop for calllog, you can add a return block here.
      
      // 4. Create new customer because they don't exist anywhere yet
      const { data: newCustomer, error: custError } = await supabase
        .from("customer")
        .insert([{ name, number: normalizedNumber, address }])
        .select()
        .single();

      if (custError) return res.status(400).json({ success: false, message: custError.message });
      
      targetCustomerId = newCustomer.id;
    }

 // 5. Insert lead (Using the resolved targetCustomerId)
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert([{
        customer_id: targetCustomerId,
        work_type: workType,
        status: "pending",
        assigned_to: assignedTo || null,
        notes: workType === "sales" ? "sales" : notes || null
      }])
      .select()
      .single();

    if (leadError) {
      return res.status(400).json({ success: false, message: leadError.message });
    }

    // 6. Insert multiple products into lead_items only if workType is sales
    if (workType === "sales" && Array.isArray(products) && products.length > 0) {
      const itemsToInsert = products.map(item => ({
        lead_id: lead.id,
        product_id: item.product_id,
        qty: item.qty
      }));

      const { error: itemsError } = await supabase
        .from("lead_items")
        .insert(itemsToInsert);

      if (itemsError) {
        return res.status(400).json({ success: false, message: itemsError.message });
      }
    }

    return res.status(201).json({ 
      success: true, 
      message: "Lead processed successfully", 
      lead 
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update task status
 * - When status = "progress" → set assigned_to
 * - When status = "done" → set monthsInterval and create service_alert
 */

export const updateTaskStatus = async (req, res) => {
  try {
    const { leadId, status, assignedTo, monthsInterval, createServiceAlert } = req.body;

    // Check existing record
    const { data: lead, error: fetchError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .maybeSingle();

    if (fetchError || !lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    // Build update payload for the lead
    const updatePayload = { status };
    if (status === "progress") {
      
     if (!assignedTo)  {
              return res.status(400).json({message:"assign pantra potta"});
    }
      updatePayload.assigned_to = assignedTo;
    }
    
    // REMOVED: updatePayload.months_interval assignment to prevent schema cache error

    // Update lead status
    const { data: updated, error: updateError } = await supabase
      .from("leads")
      .update(updatePayload)
      .eq("id", leadId)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ success: false, message: updateError.message });
    }

    // If it's a service lead, status is done, and the user opted for a service interval
    if (updated.work_type === "sales" && status === "done" && createServiceAlert === true) {
      
      const interval = parseInt(monthsInterval, 10) || 3; 
      
      const alertDate = new Date();
      alertDate.setMonth(alertDate.getMonth() + interval);

      // Successfully maps months_interval directly to the 'service' table instead
      const { error: serviceTableError } = await supabase
        .from("service_alert") 
        .insert([{
          lead_id: updated.id,
          alert_date: alertDate.toISOString().split("T")[0], 
          alert_time: "09:00:00",
          months_interval: interval
        }]);

      if (serviceTableError) {
        return res.status(400).json({ success: false, message: serviceTableError.message });
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: "Lead status updated and service recorded successfully", 
      data: updated 
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};