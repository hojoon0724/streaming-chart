import dailyTotals from "../../data/global_daily_totals.json";

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
    return res.status(400).json({ error: "Invalid limit (must be between 1 and 500)" });
  }

  // Prepare data with original rank
  const withRank = dailyTotals.map((item, i) => ({ ...item, rank: i + 1 }));
  // If searching, filter entire dataset and return all matches with preserved rank
  if (search.trim()) {
    const lower = search.toLowerCase();
    const filtered = withRank.filter(
      (item) => item.trackName.toLowerCase().includes(lower) || item.artist.toLowerCase().includes(lower)
    );
    const songs = filtered.map((item) => ({
      trackId: item.trackId,
      trackName: item.trackName,
      artistNames: item.artist,
      days: item.days,
      totalPlays: item.total,
      rank: item.rank,
    }));
    return res.status(200).json({
      songs,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalSongs: songs.length,
        limit: songs.length,
        hasNextPage: false,
        hasPreviousPage: false,
        startIndex: 1,
        endIndex: songs.length,
      },
    });
  }

  const allRecords = dailyTotals;
  const totalItems = allRecords.length;
  const totalPages = Math.ceil(totalItems / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = Math.min(startIndex + limitNum, totalItems);

  const pageSlice = allRecords.slice(startIndex, endIndex);
  const songs = pageSlice.map((item, index) => ({
    trackId: item.trackId,
    trackName: item.trackName,
    artistNames: item.artist,
    days: item.days,
    totalPlays: item.total,
    rank: startIndex + index + 1,
  }));

  res.status(200).json({
    songs,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalSongs: totalItems,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
      startIndex: startIndex + 1,
      endIndex,
    },
  });
}
