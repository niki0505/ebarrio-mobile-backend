//FOR RUNNING ON PHYSICAL DEVICES

import cron from "cron";
import https from "https";
import axios from "axios";

const job = new cron.CronJob("*/14 * * * * *", async function () {
  try {
    const response = await axios.get(
      "https://ebarrio-mobile-backend.onrender.com"
    );
    console.log("GET request success:", response.status);
  } catch (error) {
    console.error("GET request failed:", error.message);
  }
});

export default job;
