import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
  Music,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import SongHistoryChart from "../components/SongHistoryChart";

export default function AggregatePage() {
  const [songData, setSongData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [expandedSongs, setExpandedSongs] = useState(new Set());
  const [payoutPerMillion, setPayoutPerMillion] = useState(5000);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const ITEMS_PER_PAGE = 100;

  useEffect(() => {
    fetchSongData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    // Filter data based on search query
    if (!searchQuery.trim()) {
      setFilteredData(songData);
    } else {
      const filtered = songData.filter(
        (song) =>
          song.trackName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artistNames.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [songData, searchQuery]);

  const fetchSongData = async (page) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/songs?page=${page}&limit=${ITEMS_PER_PAGE}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();

      setSongData(data.songs);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching song data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPageData = () => {
    return searchQuery.trim() ? filteredData : songData; // Use filtered data when searching
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const calculateEstimatedPayout = (totalPlays) => {
    const millions = totalPlays / 1000000;
    const payout = millions * payoutPerMillion;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(payout);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const toggleSongExpansion = (trackId) => {
    const newExpanded = new Set(expandedSongs);
    if (newExpanded.has(trackId)) {
      newExpanded.delete(trackId);
    } else {
      newExpanded.add(trackId);
    }
    setExpandedSongs(newExpanded);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const goToPage = (page) => {
    if (page !== currentPage && page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    const totalPages = pagination.totalPages || 0;

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header
          title="Charts by Song"
          showBackButton={true}
          iconColor="text-green-600 dark:text-green-400"
          showPayoutSetting={true}
          payoutPerMillion={payoutPerMillion}
          onPayoutChange={setPayoutPerMillion}
        />
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-green-600 dark:text-green-400 animate-spin mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-300">Loading song data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header
          title="Charts by Song"
          showBackButton={true}
          iconColor="text-green-600 dark:text-green-400"
          showPayoutSetting={true}
          payoutPerMillion={payoutPerMillion}
          onPayoutChange={setPayoutPerMillion}
        />
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => fetchSongData(currentPage)}
              className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Charts by Song"
        showBackButton={true}
        iconColor="text-green-600 dark:text-green-400"
        showPayoutSetting={true}
        payoutPerMillion={payoutPerMillion}
        onPayoutChange={setPayoutPerMillion}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Top Songs by Total Plays</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Showing {formatNumber(pagination.totalSongs || 0)} songs ranked by total stream count
              </p>
            </div>
            <Music className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>

          {/* Artist Table */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-green-50 dark:bg-gray-700 border-b border-green-100 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-300">
                  Page {currentPage} of {pagination.totalPages || 0}
                </h3>

                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search songs or artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-64 pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  {searchQuery && (
                    <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <X className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                  )}
                </div>
              </div>

              {searchQuery && (
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  {filteredData.length > 0
                    ? `Found ${filteredData.length} song${filteredData.length === 1 ? "" : "s"} matching "${searchQuery}"`
                    : `No songs found matching "${searchQuery}"`}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-80">
                      Song Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-60">
                      Artist(s)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                      Total Plays
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                      Est. Payout
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {getCurrentPageData().map((song, index) => (
                    <React.Fragment key={song.trackId}>
                      <tr
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                        onClick={() => toggleSongExpansion(song.trackId)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          #{song.rank}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-green-600 dark:text-green-400 transition-colors">
                              {song.trackName}
                            </div>
                            {expandedSongs.has(song.trackId) ? (
                              <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{song.artistNames}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{song.duration}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                            {formatNumber(song.totalPlays)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-green-600 dark:text-green-400 font-mono font-medium">
                            {calculateEstimatedPayout(song.totalPlays)}
                          </div>
                        </td>
                      </tr>
                      {expandedSongs.has(song.trackId) && (
                        <tr>
                          <td colSpan="6" className="p-0">
                            <div className="max-w-full overflow-hidden">
                              <SongHistoryChart
                                trackId={song.trackId}
                                isOpen={expandedSongs.has(song.trackId)}
                                onClose={() => toggleSongExpansion(song.trackId)}
                                payoutPerMillion={payoutPerMillion}
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {!searchQuery && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {pagination.startIndex || 0} to {pagination.endIndex || 0} of{" "}
                  {formatNumber(pagination.totalSongs || 0)} songs
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {getPaginationRange().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === "number" && goToPage(page)}
                      disabled={page === "..."}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === currentPage
                          ? "bg-green-600 text-white"
                          : page === "..."
                            ? "text-gray-400 cursor-default"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Search Results Summary */}
          {searchQuery && filteredData.length > 0 && (
            <div className="mt-6 flex items-center justify-center">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing all {filteredData.length} search result{filteredData.length === 1 ? "" : "s"} for "{searchQuery}
                "
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
