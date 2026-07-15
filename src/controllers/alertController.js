import supabase from "../config/supabaseclient.js";

export const getService = async (req, res) => {
    try {
        
          const{data, error} = await supabase
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
        address
      )
    )
  `)
          .order("created_at",{ascending : false});

          if(error){
            return res.status(400)
            .json({
                success:false,
                code:error.code,
                message:error.message,
                detail:error.detail
            });
          }
            return res.status(200)
            .json({
                success:true,
                data
            });
    } catch (err) {
         return res.status(500)
            .json({
                message:"server error",
                detail:err.detail
            });
    }
}

export const getServiceemp = async (req, res) => {
    try {
        
          const{data, error} = await supabase
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
        address
      )
    )
  `)
          .neq("status","closed")
          .order("created_at",{ascending : false});

          if(error){
            return res.status(400)
            .json({
                success:false,
                code:error.code,
                message:error.message,
                detail:error.detail
            });
          }
            return res.status(200)
            .json({
                success:true,
                data
            });
    } catch (err) {
         return res.status(500)
            .json({
                message:"server error",
                detail:err.detail
            });
    }
}

export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;         // lead id from URL
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
