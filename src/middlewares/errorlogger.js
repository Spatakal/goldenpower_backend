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

  res.status(500).json({ success: false, error: err.message });
}

