import {
  ArrowUpDown,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Music,
  PlayCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import globalData from "../data/countries/global.json";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("totalStreams");
  const [sortDirection, setSortDirection] = useState("desc");
  const [expandedArtists, setExpandedArtists] = useState(new Set());
  const [payoutPerMillion, setPayoutPerMillion] = useState(5000);
  const itemsPerPage = 100;

  // Process the data
  const processedData = useMemo(() => {
    return globalData.chart_data;
  }, []);

  // Artist aggregation data
  const artistData = useMemo(() => {
    const artistStats = {};

    processedData.forEach((item) => {
      const artist = item.artists[0]; // Primary artist
      if (!artistStats[artist]) {
        artistStats[artist] = {
          name: artist,
          totalStreams: 0,
          totalTracks: new Set(),
          peakPosition: 200,
          averagePosition: 0,
          genres: new Set(),
          firstAppearance: item.date,
          lastAppearance: item.date,
          chartWeeks: 0,
        };
      }

      const stats = artistStats[artist];
      stats.totalStreams += item.streams;
      stats.totalTracks.add(item.name);
      stats.peakPosition = Math.min(stats.peakPosition, item.position);
      stats.chartWeeks += 1;

      if (item.artist_genres) {
        item.artist_genres.forEach((genre) => stats.genres.add(genre));
      }

      if (item.date < stats.firstAppearance) {
        stats.firstAppearance = item.date;
      }
      if (item.date > stats.lastAppearance) {
        stats.lastAppearance = item.date;
      }
    });

    // Process the aggregated data
    const artistArray = Object.values(artistStats).map((artist) => {
      const songs = processedData
        .filter((item) => item.artists[0] === artist.name)
        .reduce((acc, item) => {
          const existing = acc.find((song) => song.name === item.name);
          if (existing) {
            existing.totalStreams += item.streams;
            existing.chartWeeks += 1;
            existing.peakPosition = Math.min(existing.peakPosition, item.position);
            existing.lastChart = item.date > existing.lastChart ? item.date : existing.lastChart;
          } else {
            acc.push({
              name: item.name,
              totalStreams: item.streams,
              peakPosition: item.position,
              chartWeeks: 1,
              firstChart: item.date,
              lastChart: item.date,
              duration: item.duration,
              explicit: item.explicit,
              genres: item.artist_genres || [],
            });
          }
          return acc;
        }, [])
        .sort((a, b) => b.totalStreams - a.totalStreams);

      // Calculate percentages for stacked bar chart
      const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1", "#d084d0", "#ffb347", "#87ceeb"];
      const generateColor = (index) => {
        if (index < colors.length) {
          return colors[index];
        } else {
          const hue = (index * 137.5) % 360;
          return `hsl(${hue}, 70%, 60%)`;
        }
      };

      songs.forEach((song, index) => {
        const percentage = (song.totalStreams / artist.totalStreams) * 100;
        song.percentage = percentage;
        song.color = generateColor(index);
        song.estimatedPayout = (song.totalStreams / 1000000) * payoutPerMillion;
      });

      return {
        ...artist,
        totalTracks: artist.totalTracks.size,
        genres: Array.from(artist.genres).join(", "),
        totalStreams: artist.totalStreams,
        averagePosition:
          processedData
            .filter((item) => item.artists[0] === artist.name)
            .reduce((sum, item) => sum + item.position, 0) /
          processedData.filter((item) => item.artists[0] === artist.name).length,
        songs: songs,
        estimatedPayout: (artist.totalStreams / 1000000) * payoutPerMillion,
      };
    });

    // Sort the data
    const sortedArtists = artistArray.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Paginate the data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedArtists.slice(startIndex, startIndex + itemsPerPage);

    return {
      artists: paginatedData,
      totalArtists: sortedArtists.length,
      totalPages: Math.ceil(sortedArtists.length / itemsPerPage),
    };
  }, [processedData, currentPage, sortField, sortDirection, payoutPerMillion]);

  // Toggle artist expansion
  const toggleArtistExpansion = (artistName) => {
    const newExpanded = new Set(expandedArtists);
    if (newExpanded.has(artistName)) {
      newExpanded.delete(artistName);
    } else {
      newExpanded.add(artistName);
    }
    setExpandedArtists(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Music className="text-purple-600" />
            Global Streaming Analytics
          </h1>
          <p className="text-gray-600">Data only from Spotify (30% of global market)</p>
          <p className="text-gray-600">
            Analyzing {globalData.total_entries.toLocaleString()} chart entries from global streaming data
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{processedData.length.toLocaleString()}</p>
              </div>
              <BarChart3 className="text-purple-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Tracks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(processedData.map((item) => item.name)).size.toLocaleString()}
                </p>
              </div>
              <Music className="text-purple-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Streams</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(processedData.reduce((sum, item) => sum + item.streams, 0) / 1000000000).toFixed(1)}B
                </p>
              </div>
              <PlayCircle className="text-purple-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Date Range</p>
                <p className="text-lg font-bold text-gray-900">
                  {processedData.length > 0
                    ? `${processedData[0]?.date?.substring(0, 7)} - ${processedData[processedData.length - 1]?.date?.substring(0, 7)}`
                    : "No data"}
                </p>
              </div>
              <Calendar className="text-purple-600" size={32} />
            </div>
          </div>
        </div>

        {/* Artists Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Artist Analytics</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="text-green-600" size={20} />
                <label htmlFor="payout" className="text-sm font-medium text-gray-700">
                  Payout per 1M streams:
                </label>
                <input
                  id="payout"
                  type="number"
                  value={payoutPerMillion}
                  onChange={(e) => setPayoutPerMillion(Number(e.target.value))}
                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  min="0"
                  step="100"
                />
              </div>
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, artistData.totalArtists)} of {artistData.totalArtists} artists
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-[30ch]"
                    onClick={() => {
                      if (sortField === "name") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("name");
                        setSortDirection("asc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Artist
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th
                    className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 "
                    onClick={() => {
                      if (sortField === "totalStreams") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("totalStreams");
                        setSortDirection("desc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Total
                      <br />
                      Streams
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th
                    className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 flex justify-end"
                    onClick={() => {
                      if (sortField === "totalTracks") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("totalTracks");
                        setSortDirection("desc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Tracks
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: "40%" }}
                  >
                    Song Distribution
                  </th>
                  <th
                    className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 "
                    onClick={() => {
                      if (sortField === "estimatedPayout") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("estimatedPayout");
                        setSortDirection("desc");
                      }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Estimated
                      <br />
                      Payout
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {artistData.artists.map((artist, index) => (
                  <>
                    <tr
                      key={artist.name}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleArtistExpansion(artist.name)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {expandedArtists.has(artist.name) ? (
                            <ChevronDown size={16} className="text-gray-400" />
                          ) : (
                            <ChevronRight size={16} className="text-gray-400" />
                          )}
                          <div className="font-medium text-gray-900">{artist.name}</div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                        {(artist.totalStreams / 1000000).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        M
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{artist.totalTracks}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!expandedArtists.has(artist.name) ? (
                          <div className="w-full">
                            <div
                              className="h-6 rounded flex overflow-hidden"
                              style={{ backgroundColor: "#e5e7eb", width: "100%" }}
                            >
                              {artist.songs.map((song, index) => (
                                <div
                                  key={index}
                                  className="h-full"
                                  style={{
                                    backgroundColor: song.color,
                                    width: `${song.percentage}%`,
                                    minWidth: song.percentage > 2 ? "auto" : "2px",
                                  }}
                                  title={`${song.name}: ${song.percentage.toFixed(1)}%`}
                                ></div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {artist.songs.slice(0, 3).map((song, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: song.color }}></div>
                                <span className="truncate max-w-24">{song.name}</span>
                                <span className="text-gray-500">{song.percentage.toFixed(1)}%</span>
                              </div>
                            ))}
                            {artist.songs.length > 3 && (
                              <div className="text-xs text-gray-500">+{artist.songs.length - 3} more</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        <div className="flex items-center justify-end gap-1 font-mono">
                          <DollarSign size={14} className="text-green-600" />
                          {Math.round(artist.estimatedPayout).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                    {expandedArtists.has(artist.name) && (
                      <tr>
                        <td colSpan="5" className="px-0 py-0 bg-gray-50">
                          <div className="px-6 py-4 space-y-4">
                            <h4 className="font-medium text-gray-900 mb-3">Songs by {artist.name}</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Song Title
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Total Streams
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Percentage
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Distribution
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Estimated Payout
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Duration
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Explicit
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                  {artist.songs.map((song, songIndex) => (
                                    <tr key={songIndex} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{song.name}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900 text-right font-mono">
                                        {(song.totalStreams / 1000000).toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                        M
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-900 text-right font-mono">
                                        <div className="flex items-center justify-end gap-2">
                                          <div
                                            className="w-3 h-3 rounded"
                                            style={{ backgroundColor: song.color }}
                                          ></div>
                                          {song.percentage.toFixed(2)}%
                                        </div>
                                      </td>
                                      <td className="px-4 py-2" style={{ width: "200px" }}>
                                        <div
                                          className="h-4 rounded"
                                          style={{
                                            backgroundColor: "#e5e7eb",
                                            width: "100%",
                                            position: "relative",
                                          }}
                                        >
                                          <div
                                            className="h-4 rounded"
                                            style={{
                                              backgroundColor: song.color,
                                              width: `${(song.totalStreams / artist.songs[0].totalStreams) * 100}%`,
                                              transition: "width 0.3s ease",
                                            }}
                                            title={`${song.percentage.toFixed(2)}% of artist total, ${((song.totalStreams / artist.songs[0].totalStreams) * 100).toFixed(2)}% relative to top song`}
                                          ></div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-900 text-right font-mono">
                                        <div className="flex items-center justify-end gap-1">
                                          <DollarSign size={12} className="text-green-600" />
                                          {Math.round(song.estimatedPayout).toLocaleString()}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-900 text-right font-mono">
                                        {song.duration
                                          ? `${Math.floor(song.duration / 60000)}:${Math.floor(
                                              (song.duration % 60000) / 1000
                                            )
                                              .toString()
                                              .padStart(2, "0")}`
                                          : "N/A"}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-900">
                                        {song.explicit ? (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Explicit
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Clean
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Page {currentPage} of {artistData.totalPages}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.min(artistData.totalPages, currentPage + 1))}
                disabled={currentPage === artistData.totalPages}
                className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(artistData.totalPages)}
                disabled={currentPage === artistData.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
