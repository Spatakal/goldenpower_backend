import supabase from "../config/supabaseclient.js";

export const getBal = async (req, res)=> {
    try {
const { data, error } = await supabase 
  .from('balance')
  .select('*')
  .order('amount', { ascending: false })
  .neq('status', 'settled'); 

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

export const createBal = async (req, res)=>{
try {
        const {number, amount, name} = req.body;

        const normalizedNumber = req.number;
         
        if (!name){
            return res.status(400).json({
                success:false,
                message:"poda sotta"
            })
        }
        const {data, error} = await supabase
        .from('balance')
        .insert([{
             number:normalizedNumber,
             name,
             amount, 
             status:"pending",
             notes:"customer_balance"
            }])
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
        res.status(200) .json({message:"okay da sotta", bal:data})
    } catch (error) {
        res.status(500).json({
           error: 'server error'
        });
    }
}