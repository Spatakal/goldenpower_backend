import supabase from '../config/supabaseclient.js';

export const getUsers = async (req, res)=>{
    try {
        const { data, error} = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

        if (error) return res.status(400).json({ error: error.message });

        res.status(200).json(data);
        
    }catch (error) {    
        res.status(500).json({ error: 'error occured while fetching users' });
    }   
};


export const createUsers = async (req, res)=>{
    try {
        const { name, number, role, passkey} = req.body;

        const{data, error}= await supabase
        .from('users')
        .insert([{name, number, role, passkey}])
        .select();
        
        if (error) {
            return res.status(400)
            .json({
                 success: false,
                 code:error.code,
                 message: error.message,
                 detail: error.details  
                 });
            }

        res.status(201).json({message:"created" ,user:data});
        
    }catch (error) {    
        res.status(500).json({ error: 'error occured while fetching users' });
    }   
};
