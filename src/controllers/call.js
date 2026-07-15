import supabase from '../config/supabaseclient.js';

export const getLog = async(req, res)=>{
    try {
        const {data, error} = await supabase
        .from('calllog')
        .select('*')
        .order("created_at", { ascending: false });

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

export const upsertLog = async (req, res) => {
  try {
   const { number, name, status, address, notes } = req.body;

   const normalizedNumber = req.number;

    // Check existing record
    const { data: exist, error: fetchError } = await supabase
      .from("calllog")
      .select("*")
      .eq("number", normalizedNumber)
      .maybeSingle();

    if (fetchError) {
      return res.status(400).json({
        success: false,
        error: fetchError.message
      });
    }

    // NUMBER NOT FOUND
    if (!exist) {
      if (!status) {
        return res.status(200).json({
          success: true,
          exists: false,
          message: "Number not found. Create new record."
        });
      }
      
     //check notes add or not
      if (!notes) {
        return res.status(400).json({
          success: false,
          exists: false,
          message: "add notes"
        });
      }

      // allow creating followup
        if (status !== "followup"){
        return res.status(400).json({
          success: false,
          message: "New records can only be created with followup"
        });
      }

      const { data: newRecord, error: insertError } = await supabase
        .from("calllog")
        .insert([
          {
            number:normalizedNumber,
            name,
           status,
           address, 
           notes 
          }
        ])
        .select()
        .single();

      if (insertError) {
        return res.status(400).json({
          success: false,
          error: insertError.message
        });
      }

      return res.status(201).json({
        success: true,
        message: "New followup record created.",
        data: newRecord
      });
    }

    // NUMBER EXISTS

    // No status -> return record
    if (!status) {
      return res.status(200).json({
        success: true,
        exists: true,
        data: exist
      });
    }

    // EXIST FOLLOWUP RECORD
    if (exist.status === "followup") {

      if (status === "followup") {
        return res.status(200).json({
          success: true,
          exists: true,
          message: "Record already exists with followup status.",
          actions: ["remove"],
          data: exist
        });
      }

      if (status === "remove") {
        const { error: deleteError } = await supabase
          .from("calllog")
          .delete()
          .eq("number", normalizedNumber);

        if (deleteError) {
          return res.status(400).json({
            success: false,
            error: deleteError.message
          });
        }

        return res.status(200).json({
          success: true,
          message: "Record removed successfully."
        });
      }
    }

    return res.status(400).json({
      success: false,
      message: "Invalid status transition."
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};