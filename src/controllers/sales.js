import supabase from '../config/supabaseclient.js';

export const getSal = async(req, res)=>{
    try {
        const {data, error} = await supabase
        .from('sales')
        .select('*');

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


export const createSal = async(req, res)=>{
    try {
        const {number, amount} = req.body;
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

        const {data, error} = await supabase
        .from('sales')
        .insert([{number, amount}])
        .select();

     if(error) {
         return res.status(400)
        .json({
               sucess:false,
               code:error.code,
               message:error.message,
               detail:error.details
              });
            }
        res.status(200) .json({message:"created", sal:data})
    } catch (error) {
        res.status(500).json({
           error: 'server error'
        });
    }
}