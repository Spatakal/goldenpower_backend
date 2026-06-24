import supabase from "../config/supabaseclient.js";

export const getOff = async (req, res)=> {
    try {
        const {data, error} = await supabase 
        .from('office')
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

export const createOff = async (req, res)=>{
try {
    const {price, notes} = req.body;
  
        const {data, error} = await supabase
        .from('office')
        .insert([{price, notes}])
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