// errorLogger.js
export default function errorLogger(err, req, res, next) {
  const istNow = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  console.error("========== ERROR ==========");
  console.error(`Time     : ${istNow}`);
  console.error(`Method   : ${req.method}`);
  console.error(`URL      : ${req.originalUrl}`);
  console.error(`Message  : ${err.message}`);
  console.error(`Stack    : ${err.stack}`);
  console.error("===========================\n");

  // 🔑 Capture the error response body
  const errorResponse = { success: false, error: err.message };

  // Log the response payload (pretty-print if JSON)
  console.error("========== ERROR RESPONSE ==========");
  console.error(
    typeof errorResponse === "object"
      ? JSON.stringify(errorResponse, null, 2)
      : errorResponse
  );
  console.error("===================================\n");

  // Send response to browser
  res.status(500).json(errorResponse);
}
