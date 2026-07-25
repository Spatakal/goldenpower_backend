import supabase from "../config/supabaseclient.js";

export const attendance = async (req, res) => {
  try {
    // 1. Admin POST sends number in body; Employee GET uses token
    const targetNumber = req.body.number || req.user.number;

    if (!targetNumber) {
      return res.status(400).json({ success: false, message: "Number is required." });
    }

    // 2. Find when the user was registered (Start Date for tracking)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("created_at")
      .eq("number", targetNumber)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: "Employee not found in users table."
      });
    }

    // 3. Fetch all logged-in (present) dates for this number
    const { data: attendanceData, error: attenError } = await supabase
      .from("attendance")
      .select("attendance_date")
      .eq("number", targetNumber)
      .order("attendance_date");

    if (attenError) throw attenError;

    // Array of strings: e.g. ["2026-07-25"]
    const presentDates = attendanceData ? attendanceData.map(row => row.attendance_date) : [];

    // 4. Define range from User Registration Date to Today
    const startDate = new Date(user.created_at);
    const today = new Date();

    const absentDates = [];

    // Loop through every single calendar day
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];

      // If the date is NOT present in the attendance table, it's marked as absent
      if (!presentDates.includes(dateStr)) {
        absentDates.push(dateStr);
      }
    }

    const totalPresent = presentDates.length;
    const totalAbsent = absentDates.length;
    const totalDays = totalPresent + totalAbsent;

    const percentage = totalDays === 0
      ? 0
      : Number(((totalPresent / totalDays) * 100).toFixed(2));

    return res.status(200).json({
      number: targetNumber,
      present_dates: presentDates,
      absent_dates: absentDates,
      total_present: totalPresent,
      total_absent: totalAbsent,
      attendance_percentage: percentage
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const attendanceByMonth = async (req, res) => {
  try {
    const number = req.user.number;
    const monthParam = parseInt(req.query.month, 10); // e.g. ?month=6

    if (!monthParam || monthParam < 1 || monthParam > 12) {
      return res.status(400).json({ error: "Invalid month parameter" });
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // JS months are 0-based
    const currentYear = today.getFullYear();

    // If requested month is greater than current month, roll back to previous year
    const year = monthParam > currentMonth ? currentYear - 1 : currentYear;

    // Build start and end of month
    const startDate = new Date(year, monthParam - 1, 1);
    const endDate = new Date(year, monthParam, 0); // last day of month

    // Query Supabase for attendance records in that month
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("number", number)
      .gte("attendance_date", startDate.toISOString().split("T")[0])
      .lte("attendance_date", endDate.toISOString().split("T")[0])
      .order("attendance_date");

    if (error) {
      return res.status(400).json({
        success: false,
        code: error.code,
        message: error.message,
        detail: error.details,
      });
    }

    const presentDates = data.map(row => row.attendance_date);

    const absentDates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().split("T")[0];
      if (!presentDates.includes(date)) {
        absentDates.push(date);
      }
    }

    const totalPresent = presentDates.length;
    const totalAbsent = absentDates.length;

    const percentage =
      totalPresent + totalAbsent === 0
        ? 0
        : Number(((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(2));

    return res.status(200).json({
      month: monthParam,
      year,
      present_dates: presentDates,
      absent_dates: absentDates,
      total_present: totalPresent,
      total_absent: totalAbsent,
      attendance_percentage: percentage,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
