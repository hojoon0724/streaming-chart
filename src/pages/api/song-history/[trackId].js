import chartsData from "../../../data/global_charts_by_date.json";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { trackId } = req.query;

    if (!trackId) {
      return res.status(400).json({ error: "Track ID is required" });
    }

    // Find all occurrences of this track in the charts
    const trackHistory = [];

    Object.entries(chartsData.charts).forEach(([date, tracks]) => {
      const track = tracks.find((t) => t.track_id === trackId);
      if (track) {
        trackHistory.push({
          date,
          streams: track.streams,
          position: track.position,
          trackName: track.track_name,
          artists: track.artists,
        });
      }
    });

    if (trackHistory.length === 0) {
      return res.status(404).json({ error: "Track not found in charts" });
    }

    // Sort by date (oldest first for chart display)
    trackHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Add week numbers for easier understanding
    const historyWithWeeks = trackHistory.map((entry, index) => ({
      ...entry,
      week: index + 1,
      formattedDate: new Date(entry.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    res.status(200).json({
      trackId,
      trackName: trackHistory[0].trackName,
      artists: trackHistory[0].artists,
      totalWeeks: trackHistory.length,
      history: historyWithWeeks,
    });
  } catch (error) {
    console.error("Error fetching song history:", error);
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
}
