import data from "../../data/weekly/global_daily_totals.json";

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

  // Aggregate total plays by artist
  const artistMap = new Map();
  data.forEach((item) => {
    const { artist, total } = item;
    artistMap.set(artist, (artistMap.get(artist) || 0) + total);
  });

  const allArtists = Array.from(artistMap.entries())
    .map(([name, totalPlays]) => ({ name, totalPlays }))
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
    return res.status(200).json({
      artists: filtered,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalArtists: filtered.length,
        limit: filtered.length,
        hasNextPage: false,
        hasPreviousPage: false,
        startIndex: 1,
        endIndex: filtered.length,
      },
    });
  }

  const totalArtists = artistsWithRank.length;
  const totalPages = Math.ceil(totalArtists / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = Math.min(startIndex + limitNum, totalArtists);

  const pageData = artistsWithRank.slice(startIndex, endIndex);

  // paginated artists already have rank
  const artists = pageData;

  res.status(200).json({
    artists,
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
  });
}
