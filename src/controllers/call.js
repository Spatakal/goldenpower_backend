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
   const { number, name, status } = req.body;

// Normalize Indian mobile number
const cleanNumber = String(number).replace(/\D/g, "");

let normalizedNumber = cleanNumber;

if (cleanNumber.startsWith("91") && cleanNumber.length === 12) {
  normalizedNumber = cleanNumber.slice(2);
}

// Validate 10 digit Indian mobile
if (!/^[6-9]\d{9}$/.test(normalizedNumber)) {
  return res.status(400).json({
    success: false,
    message: "Invalid Indian mobile number"
  });
}

    if (!number) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required"
      });
    }

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

      // allow creating followup
        if (status !== "followup" && status !== "done"){
        return res.status(400).json({
          success: false,
          message: "New records can only be created with followup or done status."
        });
      }

      const { data: newRecord, error: insertError } = await supabase
        .from("calllog")
        .insert([
          {
            number:normalizedNumber,
            name,
           status
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
          actions: ["done", "remove"],
          data: exist
        });
      }

      if (status === "done") {
        const { data: updated, error: updateError } = await supabase
          .from("calllog")
          .update({ status: status ,name:name})
          .eq("number", number)
          .select()
          .single();

        if (updateError) {
          return res.status(400).json({
            success: false,
            error: updateError.message
          });
        }

        return res.status(200).json({
          success: true,
          message: "Status updated to done.",
          data: updated
        });
      }

      if (status === "remove") {
        const { error: deleteError } = await supabase
          .from("calllog")
          .delete()
          .eq("number", number);

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

    // EXIST DONE RECORD
    if (exist.status === "done") {

      if (status === "done") {
        return res.status(200).json({
          success: true,
          exists: true,
          message: "Record already completed.",
          actions: ["remove"],
          data: exist
        });
      }

      if (status === "remove") {
        const { error: deleteError } = await supabase
          .from("calllog")
          .delete()
          .eq("number", number);

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