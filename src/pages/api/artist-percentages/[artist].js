import chartsData from "../../../data/global_charts_by_date.json";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { artist } = req.query;

    if (!artist) {
      return res.status(400).json({ error: "Artist name is required" });
    }

    // Create a map to aggregate song plays for the specific artist
    const songMap = new Map();

    // Process all chart data
    Object.entries(chartsData.charts).forEach(([date, tracks]) => {
      tracks.forEach((track) => {
        // Check if this track belongs to the requested artist
        if (track.artists.some((a) => a.toLowerCase() === artist.toLowerCase())) {
          const songKey = `${track.track_id}`;

          if (songMap.has(songKey)) {
            songMap.get(songKey).totalPlays += track.streams;
          } else {
            songMap.set(songKey, {
              trackId: track.track_id,
              trackName: track.track_name,
              totalPlays: track.streams,
            });
          }
        }
      });
    });

    // Convert to array and sort by total plays
    const sortedSongs = Array.from(songMap.values()).sort((a, b) => b.totalPlays - a.totalPlays);

    // Calculate total plays for percentage calculation
    const totalArtistPlays = sortedSongs.reduce((sum, song) => sum + song.totalPlays, 0);

    // Return only the array of percentages
    const percentages = sortedSongs.map((song) =>
      totalArtistPlays > 0 ? (song.totalPlays / totalArtistPlays) * 100 : 0
    );

    res.status(200).json({
      artist,
      percentages,
      totalSongs: sortedSongs.length,
    });
  } catch (error) {
    console.error("Error processing artist percentages:", error);
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
}
