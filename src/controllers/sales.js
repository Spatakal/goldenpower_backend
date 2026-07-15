import supabase from '../config/supabaseclient.js';

export const getSal = async(req, res)=>{
    try {
        const {data, error} = await supabase
        .from('sales')
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


export const createSal = async(req, res)=>{
    try {
        const {number, amount} = req.body;

        const normalizedNumber = req.number;

        const {data, error} = await supabase
        .from('sales')
        .insert([{number:normalizedNumber, amount}])
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