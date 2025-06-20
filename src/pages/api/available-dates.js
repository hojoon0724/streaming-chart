import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const dataPath = path.join(process.cwd(), "src", "data", "global_charts_by_date.json");

    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: "Chart data file not found" });
    }

    const fileData = fs.readFileSync(dataPath, "utf8");
    const chartData = JSON.parse(fileData);

    // Return only the available dates and metadata
    const availableDates = Object.keys(chartData.charts || {}).sort();

    const response = {
      availableDates,
      metadata: chartData.metadata,
      totalDates: availableDates.length,
    };

    // console.log(response);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error reading chart data:", error);
    res.status(500).json({ error: "Failed to load available dates" });
  }
}
