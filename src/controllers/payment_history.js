import supabase from "../config/supabaseclient.js";

export const getHis = async (req, res)=> {
    try {
        const {data, error} = await supabase 
        .from('payment_history')
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

export const createHis = async (req, res) => {
  try {
    const { number, amount_paid } = req.body;

    // Fetch current balance
    const { data: bal, error: balError } = await supabase
      .from('balance')
      .select('amount')
      .eq('number', number)
      .maybeSingle();

    if (balError) {
      return res.status(400).json({
        success: false,
        message: balError.message
      });
    }

    if (!bal) {
      return res.status(404).json({
        success: false,
        message: "Balance record not found"
      });
    }

    // Validation: prevent overpayment
    if (amount_paid > bal.amount) {
      return res.status(400).json({
        success: false,
        message: "Amount paid exceeds current balance"
      });
    }

    // Insert into payment history
    const { data, error } = await supabase
      .from('payment_history')
      .insert([{ number, amount_paid }])
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        code: error.code,
        message: error.message,
        detail: error.details
      });
    }

    res.status(200).json({ message: "created", history: data });
  } catch (error) {
    res.status(500).json({ error: 'server error' });
  }
};
