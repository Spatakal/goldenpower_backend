import crypto from "crypto";
import supabase  from "../config/supabaseclient.js";

export const Login = async (req, res) => {
  try {
    const { number, password } = req.body;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("number", number)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid user"
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    await supabase
      .from("sessions")
      .delete()
      .eq("number", number);

    await supabase
      .from("sessions")
      .insert([
        {
          number,
          token_hash: tokenHash,
          role: user.role
        }
      ]);

    const today = new Date().toISOString().split("T")[0];

    await supabase
      .from("attendance")
      .upsert(
        {
          number,
          attendance_date: today
        },
        {
          onConflict: "number,attendance_date"
        }
      );

    return res.status(200).json({
      success: true,
      user: {
        name: user.name,
        number: user.number,
        role: user.role
      },
      token
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};