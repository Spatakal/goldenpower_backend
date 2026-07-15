export const validateMobile = (req, res, next) => {
  const { number } = req.body;

  if (!number) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required"
    });
  }

  // Remove everything except digits
  const cleanNumber = String(number).replace(/\D/g, "");

  let normalizedNumber = cleanNumber;

  // Remove +91 or 91 prefix
  if (cleanNumber.startsWith("91") && cleanNumber.length === 12) {
    normalizedNumber = cleanNumber.slice(2);
  }

  // Validate Indian mobile number
  if (!/^[6-9]\d{9}$/.test(normalizedNumber)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Indian mobile number"
    });
  }

  // Make normalized number available everywhere
  req.number = normalizedNumber;

  next();
};

