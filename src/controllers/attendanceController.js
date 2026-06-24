import supabase from "../config/supabaseclient.js";

export const attendanceSummary = async (req, res) => {

  try {

    const number = req.user.number;

    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("number", number)
      .order("attendance_date");

    const presentDates = data.map(
      row => row.attendance_date
    );

    const firstDate = new Date(
      presentDates[0] || new Date()
    );

    const today = new Date();

    const absentDates = [];

    for (
      let d = new Date(firstDate);
      d <= today;
      d.setDate(d.getDate() + 1)
    ) {

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
        : Number(
            (
              (totalPresent /
                (totalPresent + totalAbsent)) *
              100
            ).toFixed(2)
          );

    return res.status(200).json({
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