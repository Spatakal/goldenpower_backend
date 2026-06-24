import supabase from "../config/supabaseclient.js";

export const getHis = async (req, res)=> {
    try {
        const {data, error} = await supabase 
        .from('payment_history')
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

export const createHis = async (req, res)=>{
try {
    const {number, amount_paid} = req.body;
  
        const {data, error} = await supabase
        .from('payment_history')
        .insert([{number, amount_paid}])
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
        res.status(200) .json({message:"created", history:data})
    } catch (error) {
        res.status(500).json({
           error: 'server error'
        });
    }
}