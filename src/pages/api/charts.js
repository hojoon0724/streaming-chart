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

    // Optional: limit the data to reduce response size if needed
    const { limit, dateFrom, dateTo } = req.query;

    let filteredCharts = chartData.charts;

    if (dateFrom || dateTo) {
      const dateKeys = Object.keys(chartData.charts).sort();
      const filteredKeys = dateKeys.filter((date) => {
        if (dateFrom && date < dateFrom) return false;
        if (dateTo && date > dateTo) return false;
        return true;
      });

      filteredCharts = {};
      filteredKeys.forEach((key) => {
        filteredCharts[key] = chartData.charts[key];
      });
    }

    if (limit) {
      const limitNum = parseInt(limit);
      const dateKeys = Object.keys(filteredCharts).sort().slice(0, limitNum);
      const limitedCharts = {};
      dateKeys.forEach((key) => {
        limitedCharts[key] = filteredCharts[key];
      });
      filteredCharts = limitedCharts;
    }

    const response = {
      ...chartData,
      charts: filteredCharts,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error reading chart data:", error);
    res.status(500).json({ error: "Failed to load chart data" });
  }
}
