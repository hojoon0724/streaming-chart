import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { page = "1", limit = "100", search = "" } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({ error: "Invalid page number" });
  }
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 500) {
    return res.status(400).json({ error: "Invalid limit (1-500)" });
  }

  try {
    // Path to artist-songs directory
    const artistSongsDir = path.join(process.cwd(), "src", "data", "artists-songs");
    const files = fs.readdirSync(artistSongsDir).filter((file) => file.endsWith(".json"));

    // Aggregate total plays by artist from all JSON files
    const artistMap = new Map();

    files.forEach((file) => {
      try {
        const filePath = path.join(artistSongsDir, file);
        const artistData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        if (artistData.artist && artistData.songs) {
          const totalPlays = artistData.songs.reduce((sum, song) => sum + (song.total || 0), 0);
          const totalSongs = artistData.songs.length;

          artistMap.set(artistData.artist, {
            totalPlays,
            totalSongs,
            artistId: artistData.artistId,
          });
        }
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }
    });

    const allArtists = Array.from(artistMap.entries())
      .map(([name, data]) => ({
        name,
        totalPlays: data.totalPlays,
        totalSongs: data.totalSongs,
        artistId: data.artistId,
      }))
      .sort((a, b) => b.totalPlays - a.totalPlays);

    // assign ranks to full artist list
    const artistsWithRank = allArtists.map((artist, idx) => ({
      ...artist,
      rank: idx + 1,
    }));

    // if searching, filter entire list and return matches
    if (search.trim()) {
      const lower = search.toLowerCase();
      const filtered = artistsWithRank.filter((a) => a.name.toLowerCase().includes(lower));
      const totalSongsInSearch = filtered.reduce((sum, artist) => sum + artist.totalSongs, 0);
      return res.status(200).json({
        artists: filtered,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalArtists: filtered.length,
          totalSongs: totalSongsInSearch,
          limit: filtered.length,
          hasNextPage: false,
          hasPreviousPage: false,
          startIndex: 1,
          endIndex: filtered.length,
        },
      });
    }

    const totalArtists = artistsWithRank.length;
    const totalSongs = allArtists.reduce((sum, artist) => sum + artist.totalSongs, 0);
    const totalPages = Math.ceil(totalArtists / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = Math.min(startIndex + limitNum, totalArtists);

    const pageData = artistsWithRank.slice(startIndex, endIndex);

    res.status(200).json({
      artists: pageData,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalArtists,
        totalSongs,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
        startIndex: startIndex + 1,
        endIndex,
      },
    });
  } catch (error) {
    console.error("Error in aggregate-everything API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
