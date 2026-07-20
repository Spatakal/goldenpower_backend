import supabase from "../config/supabaseclient.js";

// 1. GET INVENTORY
export const getStk = async (req, res) => {
  try {
    const { id } = req.query;

    // If looking for a specific ID -> Include product details
    if (id) {
      const { data, error } = await supabase
        .from("inventory")
        .select(`*`)
        .eq("id", id)
        .single();

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, inventory: data });
    } 
    
    // If fetching all inventories -> Simple select, no products array included at all
    const { data, error } = await supabase
      .from("inventory")
      .select(`*`)
      .order("created_at",{ascending:false});

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, inventories: data });

  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};


// 2. CREATE INVENTORY WITH PRODUCTS
export const createStk = async (req, res) => {
  try {
    const {
      invoice,
      supplier_name,
      total_amount,
      paid_amount = 0
    } = req.body;

    // Step 1: Insert inventory row (Removed supplier_number completely)
    const { data: inv, error: invErr } = await supabase
      .from("inventory")
      .insert([{
        supplier_name,
        total_amount,
        paid_amount
      }])
      // Pulling supplier_name & invoice here to use in Step 3 safely
      .select("id, total_amount, paid_amount, supplier_name") 
      .single();

    if (invErr) {
      return res.status(400).json({ success: false, message: invErr.message });
    }

    // Step 3: Automatically track balance if not paid in full
    const balanceAmount = inv.total_amount - inv.paid_amount;
    if (balanceAmount > 0) {
      const { error: balErr } = await supabase
        .from("balance")
        .insert([{
          name: inv.supplier_name,
          number: inv.id,
          amount: balanceAmount,
          status: "pending",
          notes: "purchase_balance"
        }]);

      if (balErr) {
        return res.status(400).json({ success: false, message: balErr.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Inventory added successfully!",
      inventory: inv
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || "Server error" });
  }
};