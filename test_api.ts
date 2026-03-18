import { post } from "./src/shared/services/api-client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development" });
const HOST_ID = "5fb82ee418d184001c402179";
const token = process.env.VITE_TEST_TOKEN || "";

async function run() {
  const payload = {
    viewType: null,
    groupId: "5a0da2ba5f9922001e35ffdf",
    hosts: [],
    courses: [],
    faculty: null,
    datesViewType: "week",
    fromDate: "01092025",
    toDate: "28022026",
    hostId: HOST_ID,
  };

  try {
    const res = await fetch("https://appweb-dev.ezcheck.me/api/admin/ggs_gg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log("GraphData Keys:", Object.keys(data));
    console.log("overallGraphData:", data.overallGraphData?.slice(0, 3));
  } catch (err) {
    console.error(err);
  }
}

run();
