import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function errorLogger(err, req, res, next) {
  const istNow = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  console.error("========== ERROR ==========");
  console.error(`Time     : ${istNow}`);
  console.error(`Method   : ${req.method}`);
  console.error(`URL      : ${req.originalUrl}`);
  console.error(`Message  : ${err.message}`);
  console.error(`Stack    : ${err.stack}`);
  console.error("===========================\n");

  const errorResponse = { success: false, error: err.message };

  console.error("========== ERROR RESPONSE ==========");
  console.error(JSON.stringify(errorResponse, null, 2));
  console.error("===================================\n");

  // Save to DB
  await supabase.from("logs").insert({
    method: req.method,
    url: req.originalUrl,
    status: 500,
    request_body: req.body || {},
    response_body: errorResponse,
    error_message: err.message,
    error_stack: err.stack,
  });

  res.status(500).json(errorResponse);
}
