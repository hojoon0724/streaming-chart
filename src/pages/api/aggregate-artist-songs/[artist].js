import data from "../../../data/weekly/global_daily_totals.json";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { artist } = req.query;
  if (!artist) {
    return res.status(400).json({ error: "Artist name is required" });
  }
  // Aggregate total plays by track for the specific artist
  const songMap = new Map();
  data.forEach((item) => {
    if (item.artist.toLowerCase() === artist.toLowerCase()) {
      const key = item.trackId || item.trackName;
      if (songMap.has(key)) {
        songMap.get(key).totalPlays += item.total;
      } else {
        songMap.set(key, {
          trackId: item.trackId,
          trackName: item.trackName,
          totalPlays: item.total,
        });
      }
    }
  });
  const songs = Array.from(songMap.values()).sort((a, b) => b.totalPlays - a.totalPlays);
  const totalPlays = songs.reduce((sum, s) => sum + s.totalPlays, 0);
  const songsWithPercentage = songs.map((s) => ({
    ...s,
    percentage: totalPlays > 0 ? (s.totalPlays / totalPlays) * 100 : 0,
  }));
  res.status(200).json({
    artist,
    songs: songsWithPercentage,
    totalSongs: songs.length,
    totalPlays,
  });
}
