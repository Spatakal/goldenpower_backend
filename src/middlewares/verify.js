import crypto from "crypto";
import  supabase from "../config/supabaseclient.js";

export const verifyToken = async (req, res, next) => {

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

    next();

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }

};


export const adminOnly = (req, res, next) => {

  if (req.user.role !== "admin") {

    return res.status(403).json({
      success: false,
      message: "Admin access only"
    });

  }

  next();
};