
import supabase from '../config/supabaseclient.js'


export const Login = async (req, res)=>{
    try {
        const { number, passkey } = req.body;

        if (!number || !passkey){
            return res.status(400).json({success:false,error:"number or passkey not provided "})
        }

        const{data:user, error}= await supabase
        .from("users")
        .select("*")
        .eq("number", number)
        .maybeSingle();

        if (error) {
            return res.status(400)
            .json({
                 success: false,
                 code:error.code,
                 message: error.message,
                 detail: error.details  
                 });
            }
        if (!user) {
            return res.status(401)
            .json({
                 success: false,
                 error: error.message,
                  message:"user not"
                 });
            }
        res.status(200).json({success:true,message:"logined",user:{id:user.id,name:user.name,number:user.number,role:user.role}});
        
    }catch (error) {    
        res.status(500).json({message: error.message });
    }   
};
