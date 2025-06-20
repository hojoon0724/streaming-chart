import chartsData from "../../data/global_charts_by_date.json";

// Cache the processed artist data to avoid reprocessing on every request
let cachedArtistData = null;
let lastProcessedTime = null;

function processArtistData() {
  const startTime = Date.now();

  // Create a map to aggregate artist plays
  const artistMap = new Map();

  // Process all chart data
  Object.entries(chartsData.charts).forEach(([date, tracks]) => {
    tracks.forEach((track) => {
      track.artists.forEach((artist) => {
        if (artistMap.has(artist)) {
          artistMap.set(artist, artistMap.get(artist) + track.streams);
        } else {
          artistMap.set(artist, track.streams);
        }
      });
    });
  });

  // Convert to array and sort by total plays
  const sortedArtists = Array.from(artistMap.entries())
    .map(([name, totalPlays]) => ({ name, totalPlays }))
    .sort((a, b) => b.totalPlays - a.totalPlays);

  const processingTime = Date.now() - startTime;
  console.log(`Artist data processed in ${processingTime}ms for ${sortedArtists.length} artists`);

  return sortedArtists;
}

function getArtistData() {
  // Cache for 5 minutes to avoid reprocessing
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  if (!cachedArtistData || !lastProcessedTime || Date.now() - lastProcessedTime > CACHE_DURATION) {
    cachedArtistData = processArtistData();
    lastProcessedTime = Date.now();
  }

  return cachedArtistData;
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

    // Get cached artist data
    const allArtists = getArtistData();

    // Calculate pagination
    const totalArtists = allArtists.length;
    const totalPages = Math.ceil(totalArtists / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = Math.min(startIndex + limitNum, totalArtists);

    // Get the page data
    const pageData = allArtists.slice(startIndex, endIndex);

    // Add global rank to each artist
    const artistsWithRank = pageData.map((artist, index) => ({
      ...artist,
      rank: startIndex + index + 1,
    }));

    // Return paginated response
    res.status(200).json({
      artists: artistsWithRank,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalArtists,
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
    console.error("Error processing artist data:", error);
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
}
