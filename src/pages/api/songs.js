import chartsData from "../../data/weekly/global_charts_by_date.json";

// Cache the processed song data to avoid reprocessing on every request
let cachedSongData = null;
let lastProcessedTime = null;

function processSongData() {
  const startTime = Date.now();

  // Create a map to aggregate song plays
  const songMap = new Map();

  // Process all chart data
  Object.entries(chartsData.charts).forEach(([date, tracks]) => {
    tracks.forEach((track) => {
      const songKey = `${track.track_id}`;

      if (songMap.has(songKey)) {
        const existing = songMap.get(songKey);
        existing.totalPlays += track.streams;
        existing.playHistory.push({
          date,
          streams: track.streams,
          position: track.position,
        });
      } else {
        songMap.set(songKey, {
          trackId: track.track_id,
          trackName: track.track_name,
          artists: track.artists,
          genres: track.genres,
          durationMs: track.duration_ms,
          explicit: track.explicit,
          totalPlays: track.streams,
          playHistory: [
            {
              date,
              streams: track.streams,
              position: track.position,
            },
          ],
        });
      }
    });
  });

  // Convert to array and sort by total plays
  const sortedSongs = Array.from(songMap.values())
    .map((song) => ({
      ...song,
      // Sort play history by date (most recent first)
      playHistory: song.playHistory.sort((a, b) => new Date(b.date) - new Date(a.date)),
    }))
    .sort((a, b) => b.totalPlays - a.totalPlays);

  const processingTime = Date.now() - startTime;
  console.log(`Song data processed in ${processingTime}ms for ${sortedSongs.length} songs`);

  return sortedSongs;
}

function getSongData() {
  // Cache for 5 minutes to avoid reprocessing
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  if (!cachedSongData || !lastProcessedTime || Date.now() - lastProcessedTime > CACHE_DURATION) {
    cachedSongData = processSongData();
    lastProcessedTime = Date.now();
  }

  return cachedSongData;
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { page = 1, limit = 100 } = req.query;

    // Validate parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: "Invalid page number" });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 500) {
      return res.status(400).json({ error: "Invalid limit (must be between 1 and 500)" });
    }

    // Get cached song data
    const allSongs = getSongData();

    // Calculate pagination
    const totalSongs = allSongs.length;
    const totalPages = Math.ceil(totalSongs / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = Math.min(startIndex + limitNum, totalSongs);

    // Get the page data
    const pageData = allSongs.slice(startIndex, endIndex);

    // Add global rank to each song
    const songsWithRank = pageData.map((song, index) => ({
      ...song,
      rank: startIndex + index + 1,
      // Format duration for display
      duration: formatDuration(song.durationMs),
      // Join artists for display
      artistNames: song.artists.join(", "),
    }));

    // Return paginated response
    res.status(200).json({
      songs: songsWithRank,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalSongs,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
        startIndex: startIndex + 1,
        endIndex,
      },
      meta: {
        processingTime: lastProcessedTime ? Date.now() - lastProcessedTime : 0,
        cached: lastProcessedTime !== null,
      },
    });
  } catch (error) {
    console.error("Error processing song data:", error);
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
}

function formatDuration(durationMs) {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
