const http = require("http");

console.log("🚀 TaskFlow Pro Cron Runner Started!");
console.log("This script will ping the Next.js API route every 1 minute to check for deadlines.");

const interval = 60 * 1000; // 1 minute

setInterval(() => {
  console.log(`[${new Date().toLocaleTimeString()}] Pinging /api/cron...`);
  
  http.get("http://localhost:3000/api/cron", (res) => {
    let data = "";
    res.on("data", (chunk) => { data += chunk; });
    res.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        console.log(`[Response]: ${parsed.message || JSON.stringify(parsed)}`);
      } catch (e) {
        console.log(`[Response]: ${data}`);
      }
    });
  }).on("error", (err) => {
    console.error(`[Error]: Failed to ping /api/cron. Is the Next.js server running? (${err.message})`);
  });

}, interval);

// Ping immediately on start
http.get("http://localhost:3000/api/cron");
