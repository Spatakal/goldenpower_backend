import crypto from "crypto";
import  supabase from "../config/supabaseclient.js";

export const tokenValid = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token missing"
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const { data: session } = await supabase
      .from("sessions")
      .select("*")
      .eq("token_hash", tokenHash)
      .single();

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    req.user = {
      number: session.number,
      role: session.role
    };

    return res.status(200).json({
      success: true,
      message: "Token verified",
      user: req.user
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
