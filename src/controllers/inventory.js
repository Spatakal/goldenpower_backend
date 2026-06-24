import supabase from "../config/supabaseclient.js";

export const getStk = async (req, res)=> {
    try {
        const {data, error} = await supabase 
        .from('inventory')
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

export const createStk = async (req, res)=>{
try {
    const {invoice, supplier_name, price} = req.body;
  
        const {data, error} = await supabase
        .from('inventory')
        .insert([{invoice, supplier_name, price}])
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
        res.status(200) .json({message:"created", bal:data})
    } catch (error) {
        res.status(500).json({
           error: 'server error'
        });
    }
}