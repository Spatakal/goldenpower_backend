import supabase from "../config/supabaseclient.js";

export const getPrd = async (req, res)=> {
    try {
        const {data, error} = await supabase 
        .from('product')
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

export const createPrd = async (req, res)=>{
try {
    const {product_name, brand_name} = req.body;
  
        const {data, error} = await supabase
        .from('product')
        .insert([{product_name, brand_name}])
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
        res.status(200) .json({message:"created", prd:data})
    } catch (error) {
        res.status(500).json({
           error: 'server error'
        });
    }
}