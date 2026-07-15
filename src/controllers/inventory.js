import supabase from "../config/supabaseclient.js";

// 1. GET INVENTORY
export const getStk = async (req, res) => {
  try {
    const { id } = req.query;

    // If looking for a specific ID -> Include product details
    if (id) {
      const { data, error } = await supabase
        .from("inventory")
        .select(`
          *,
          inventory_products (
            id,
            brand_name,
            product_name,
            qty
          )
        `)
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
      paid_amount = 0,
      products = []
    } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "No products provided" });
    }

    // Step 1: Insert inventory row (Removed supplier_number completely)
    const { data: inv, error: invErr } = await supabase
      .from("inventory")
      .insert([{
        invoice,
        supplier_name,
        total_amount,
        paid_amount
      }])
      // Pulling supplier_name & invoice here to use in Step 3 safely
      .select("id, total_amount, paid_amount, supplier_name, invoice") 
      .single();

    if (invErr) {
      return res.status(400).json({ success: false, message: invErr.message });
    }

    // Step 2: Format and insert multiple products linked to this inventory
    const productRows = products.map(p => ({
      brand_name: p.brand_name,
      product_name: p.product_name,
      qty: p.qty,
      inventory_id: inv.id
    }));

    const { data: productData, error: prodErr } = await supabase
      .from("inventory_products")
      .insert(productRows)
      .select("id, brand_name, product_name, qty");

    if (prodErr) {
      return res.status(400).json({ success: false, message: prodErr.message });
    }

    // Step 3: Automatically track balance if not paid in full
    const balanceAmount = inv.total_amount - inv.paid_amount;
    if (balanceAmount > 0) {
      const { error: balErr } = await supabase
        .from("balance")
        .insert([{
          name: inv.supplier_name,
          number: inv.invoice || null, // Sets number equal to the invoice 
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
      message: "Inventory and products added successfully!",
      inventory: inv,
      products: productData
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || "Server error" });
  }
};