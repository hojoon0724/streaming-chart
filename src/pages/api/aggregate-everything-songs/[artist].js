import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { artist } = req.query;
  if (!artist) {
    return res.status(400).json({ error: "Artist name is required" });
  }

  try {
    // Path to artist-songs directory
    const artistSongsDir = path.join(process.cwd(), "src", "data", "latest", "artists-songs");
    const files = fs.readdirSync(artistSongsDir).filter((file) => file.endsWith(".json"));

    let artistData = null;

    // Find the artist data file
    for (const file of files) {
      try {
        const filePath = path.join(artistSongsDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

        if (data.artist && data.artist.toLowerCase() === artist.toLowerCase()) {
          artistData = data;
          break;
        }
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }
    }

    if (!artistData) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const songs = artistData.songs || [];
    const totalPlays = songs.reduce((sum, song) => sum + (song.total || 0), 0);

    const songsWithPercentage = songs
      .sort((a, b) => (b.total || 0) - (a.total || 0))
      .map((song) => ({
        trackId: song.trackId,
        trackName: song.trackName,
        totalPlays: song.total || 0,
        daily: song.daily || 0,
        percentage: totalPlays > 0 ? ((song.total || 0) / totalPlays) * 100 : 0,
      }));

    res.status(200).json({
      artist: artistData.artist,
      songs: songsWithPercentage,
      totalSongs: songs.length,
      totalPlays,
    });
  } catch (error) {
    console.error("Error in aggregate-everything-songs API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
