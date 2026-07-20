import supabase from '../config/supabaseclient.js';

export const getSer = async(req, res)=>{
    try {

        const {data, error} = await supabase
        .from('service')
        .select('*')
        .order("created_at",{ascending:false});
        
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


export const createSer = async(req, res)=>{
    try {
        const {number, price} = req.body;

        const normalizedNumber = req.number;

        const {data, error} = await supabase
        .from('service')
        .insert([{
            number:normalizedNumber,
            price}])
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
        res.status(200) .json({message:"created", ser:data})
    } catch (error) {
        res.status(500).json({
           error: 'server error'
        });
    }
}