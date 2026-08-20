import { config } from "dotenv";
config({ path: ".env.local" });

import { syncSearchConsole } from "../lib/analytics/searchConsole";

syncSearchConsole(14)
  .then((result) => {
    console.log("[GSC sync]", result);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
