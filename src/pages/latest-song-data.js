import { ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "../components/Header";

export default function AggregateAllPage() {
  const [songData, setSongData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [payoutPerMillion, setPayoutPerMillion] = useState(5000);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const ITEMS_PER_PAGE = 100;

  // Debounce search input to delay API calls until user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // reset to first page on new search
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchSongData(currentPage);
  }, [currentPage, debouncedSearch]);

  const fetchSongData = async (page) => {
    setLoading(true);
    setError(null);
    try {
      // Use debounced search for querying
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch);
      } else {
        params.append("page", page);
        params.append("limit", ITEMS_PER_PAGE);
      }
      const res = await fetch(`/api/daily-totals?${params.toString()}`);
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      setSongData(json.songs);
      setPagination(json.pagination);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => new Intl.NumberFormat().format(num);

  const calculateEstimatedPayout = (totalPlays) => {
    const millions = totalPlays / 1_000_000;
    const payout = millions * payoutPerMillion;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(payout);
  };

  const getCurrentPageData = () => songData;

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };
  // Reset to first page on clearing search
  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page !== currentPage && page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    const total = pagination.totalPages || 0;
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(total - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...", ...range);
    } else {
      rangeWithDots.push(1, ...range);
    }
    if (currentPage + delta < total - 1) {
      rangeWithDots.push("...", total);
    } else if (total > 1) {
      rangeWithDots.push(total);
    }
    return rangeWithDots;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Aggregate All Songs" showBackButton={true} iconColor="text-slate-600 dark:text-slate-400" />
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-slate-600 dark:text-slate-400 animate-spin mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-300">Loading song data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Aggregate All Songs" showBackButton={true} iconColor="text-slate-600 dark:text-slate-400" />
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-red-600">Error: {error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Aggregate All Songs" showBackButton={true} iconColor="text-slate-600 dark:text-slate-400" />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">All Songs Summary</h2>
            <div className="flex items-center space-x-3">
              <label htmlFor="payoutRate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Payout per 1M plays:
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  $
                </span>
                <input
                  id="payoutRate"
                  type="number"
                  min="0"
                  step="100"
                  value={payoutPerMillion}
                  onChange={(e) => setPayoutPerMillion(Number(e.target.value) || 0)}
                  className="pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-slate-500 dark:focus:border-slate-400 w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 dark:bg-gray-700 border-b border-slate-100 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-400">
                  Page {currentPage} of {pagination.totalPages || 0}
                </h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search songs or artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-64 pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-slate-500 dark:focus:border-slate-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  {searchQuery && (
                    <button onClick={handleClearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <X className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="divide-y divide-gray-200 dark:divide-gray-700 table-auto w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-right">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Song Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Artist(s)
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-right">
                      Days
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-right">
                      Total Plays
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-right">
                      Est. Payout
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {getCurrentPageData().map((song) => (
                    <tr
                      key={song.trackId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                        #{song.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {song.trackName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {song.artistNames}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono text-right">
                        {song.days}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono text-right">
                        {formatNumber(song.totalPlays)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-mono font-medium text-right">
                        {calculateEstimatedPayout(song.totalPlays)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {!searchQuery && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Showing {pagination.startIndex || 0} to {pagination.endIndex || 0} of{" "}
                {formatNumber(pagination.totalSongs || 0)} songs
              </span>
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
                  {getPaginationRange().map((page, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof page === "number" && goToPage(page)}
                      disabled={page === "..."}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${page === currentPage ? "bg-slate-600 text-white" : page === "..." ? "text-gray-400 cursor-default" : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"}`}
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
          {searchQuery && songData.length > 0 && (
            <div className="mt-6 text-sm text-gray-700 dark:text-gray-300">
              Showing all {songData.length} search result{songData.length === 1 ? "" : "s"} for "{searchQuery}"
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
