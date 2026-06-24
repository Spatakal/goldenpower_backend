import axios from "axios";

const ipRequests = {};

export default async function requestLogger(req, res, next) {
  const start = Date.now();

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    req.ip;

  ipRequests[ip] = (ipRequests[ip] || 0) + 1;

  let geo = {
    city: "Unknown",
    state: "Unknown",
    country: "Unknown",
    isp: "Unknown",
    lat: "N/A",
    lon: "N/A",
  };

  try {
    const isLocal =
      ip === "::1" ||
      ip === "127.0.0.1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.");

    if (!isLocal) {
      const { data } = await axios.get(
        `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,lat,lon,query`
      );

      if (data.status === "success") {
        geo = {
          city: data.city,
          state: data.regionName,
          country: data.country,
          isp: data.isp,
          lat: data.lat,
          lon: data.lon,
        };
      }
    }
  } catch (error) {
    console.log("Geo Lookup Error:", error.message);
  }

  console.log("\n========== REQUEST ==========");
  console.log("Time      :", new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  }));
  console.log("Method    :", req.method);
  console.log("URL       :", req.originalUrl);
  console.log("IP        :", ip);
  console.log("ISP       :", geo.isp);
  console.log("City      :", geo.city);
  console.log("State     :", geo.state);
  console.log("Country   :", geo.country);
  console.log("Latitude  :", geo.lat);
  console.log("Longitude :", geo.lon);
  console.log("Count     :", ipRequests[ip]);
  console.log("Body      :", JSON.stringify(req.body || {}));

  res.on("finish", () => {
    console.log("\n========== RESPONSE ==========");
    console.log("Status    :", res.statusCode);
    console.log("Duration  :", `${Date.now() - start}ms`);
    console.log("==============================\n");
  });

  next();
}