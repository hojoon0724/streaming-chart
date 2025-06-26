import { AlertCircle, ChevronDown, ChevronUp, Loader2, Search, User, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import ArtistCatalogExpansion from "../components/ArtistCatalogExpansion";
import Header from "../components/Header";
import Pagination from "../components/Pagination";
import StackedBarChart from "../components/StackedBarChart";

export default function AggregateEverythingPage() {
  const [artistData, setArtistData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [payoutPerMillion, setPayoutPerMillion] = useState(5000);
  const [artistPercentages, setArtistPercentages] = useState({});
  const [artistSongs, setArtistSongs] = useState({});
  const [loadingArtists, setLoadingArtists] = useState(new Set());
  const [expandedArtists, setExpandedArtists] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const ITEMS_PER_PAGE = 100;

  // Debounce search input to delay API calls until user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchArtistData(currentPage);
  }, [currentPage, debouncedSearch]);

  const fetchArtistData = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch);
      } else {
        params.append("page", page);
        params.append("limit", ITEMS_PER_PAGE);
      }
      const response = await fetch(`/api/aggregate-everything?${params.toString()}`);
      if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
      const data = await response.json();
      setArtistData(data.artists);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching aggregate everything data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => new Intl.NumberFormat().format(num);

  const calculateEstimatedPayout = (totalPlays) => {
    const millions = totalPlays / 1000000;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(millions * payoutPerMillion);
  };

  const toggleArtistExpansion = async (artistName) => {
    const newExpanded = new Set(expandedArtists);
    if (newExpanded.has(artistName)) {
      newExpanded.delete(artistName);
      setExpandedArtists(newExpanded);
      return;
    } else {
      newExpanded.add(artistName);
      setExpandedArtists(newExpanded);
    }

    if (!artistSongs[artistName] && !loadingArtists.has(artistName)) {
      const newLoading = new Set(loadingArtists);
      newLoading.add(artistName);
      setLoadingArtists(newLoading);
      try {
        const response = await fetch(`/api/aggregate-everything-songs/${encodeURIComponent(artistName)}`);
        const result = await response.json();
        setArtistSongs((prev) => ({ ...prev, [artistName]: result.songs }));
      } catch (err) {
        console.error("Error fetching artist songs:", err);
      } finally {
        setLoadingArtists((prev) => {
          const s = new Set(prev);
          s.delete(artistName);
          return s;
        });
      }
    }
  };

  const loadPercentagesForArtist = async (artistName) => {
    if (!artistPercentages[artistName] && !loadingArtists.has(artistName)) {
      const newLoading = new Set(loadingArtists);
      newLoading.add(artistName);
      setLoadingArtists(newLoading);
      try {
        // fetch per-track totals distribution from artist-songs dataset
        const response = await fetch(`/api/aggregate-everything-songs/${encodeURIComponent(artistName)}`);
        const result = await response.json();
        // store song list and distribution percentages
        setArtistSongs((prev) => ({ ...prev, [artistName]: result.songs }));
        setArtistPercentages((prev) => ({
          ...prev,
          [artistName]: {
            percentages: result.songs.map((s) => s.percentage),
            totalSongs: result.totalSongs,
          },
        }));
      } catch (err) {
        console.error("Error fetching artist percentages:", err);
      } finally {
        setLoadingArtists((prev) => {
          const s = new Set(prev);
          s.delete(artistName);
          return s;
        });
      }
    }
  };

  useEffect(() => {
    artistData.forEach((artist) => loadPercentagesForArtist(artist.name));
  }, [artistData]);

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
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }
    return rangeWithDots;
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header
          title="Aggregate Everything"
          showBackButton={true}
          iconColor="text-stone-600 dark:text-stone-400"
          showPayoutSetting={true}
          payoutPerMillion={payoutPerMillion}
          onPayoutChange={setPayoutPerMillion}
        />
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-stone-600 dark:text-stone-400 animate-spin mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-300">Loading artist data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header
          title="Aggregate Everything"
          showBackButton={true}
          iconColor="text-stone-600 dark:text-stone-400"
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
              onClick={() => fetchArtistData(currentPage)}
              className="px-4 py-2 bg-stone-600 dark:bg-stone-500 text-white rounded-md hover:bg-stone-700 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400"
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
        title="Aggregate Everything"
        showBackButton={true}
        iconColor="text-stone-600 dark:text-stone-400"
        showPayoutSetting={true}
        payoutPerMillion={payoutPerMillion}
        onPayoutChange={setPayoutPerMillion}
      />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Top Artists by Total Plays</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Showing {formatNumber(pagination.totalArtists || 0)} artists ranked by total stream count from complete
                catalog ({formatNumber(pagination.totalSongs || 0)} total songs)
              </p>
            </div>
            <User className="h-12 w-12 text-stone-600 dark:text-stone-400" />
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  Page {currentPage} of {pagination.totalPages || 0}
                </h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-64 pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400 focus:border-stone-500 dark:focus:border-stone-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-60">
                      Artist Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                      Total Plays
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                      Total Songs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-64">
                      Song Distribution
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                      Est. Payout
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {artistData.map((artist, index) => (
                    <React.Fragment key={artist.name}>
                      <tr
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                        onClick={() => toggleArtistExpansion(artist.name)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          #{artist.rank}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                              {artist.name}
                            </span>
                            {expandedArtists.has(artist.name) ? (
                              <ChevronUp className="h-4 w-4 " />
                            ) : (
                              <ChevronDown className="h-4 w-4 " />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                            {formatNumber(artist.totalPlays)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                            {artist.totalSongs || artistPercentages[artist.name]?.totalSongs || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap w-64">
                          <StackedBarChart
                            percentages={artistPercentages[artist.name]?.percentages}
                            generateRandomColor={(i) =>
                              [
                                "bg-stone-500",
                                "bg-green-500",
                                "bg-yellow-500",
                                "bg-red-500",
                                "bg-blue-500",
                                "bg-pink-500",
                                "bg-indigo-500",
                                "bg-gray-500",
                                "bg-orange-500",
                                "bg-teal-500",
                              ][i % 10]
                            }
                            isLoading={loadingArtists.has(artist.name)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-green-600 dark:text-green-400 font-mono">
                            {calculateEstimatedPayout(artist.totalPlays)}
                          </div>
                        </td>
                      </tr>
                      {expandedArtists.has(artist.name) && (
                        <tr>
                          <td colSpan="6">
                            <ArtistCatalogExpansion
                              artist={artist}
                              artistSongs={artistSongs}
                              isLoading={loadingArtists.has(artist.name)}
                              formatNumber={formatNumber}
                              generateRandomColor={(i) =>
                                [
                                  "bg-stone-500",
                                  "bg-green-500",
                                  "bg-yellow-500",
                                  "bg-red-500",
                                  "bg-blue-500",
                                  "bg-pink-500",
                                  "bg-indigo-500",
                                  "bg-gray-500",
                                  "bg-orange-500",
                                  "bg-teal-500",
                                ][i % 10]
                              }
                              calculateEstimatedPayout={calculateEstimatedPayout}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {!searchQuery && (
            <Pagination
              currentPage={currentPage}
              pagination={pagination}
              formatNumber={formatNumber}
              goToPage={goToPage}
              getPaginationRange={getPaginationRange}
            />
          )}
          {searchQuery && artistData.length > 0 && (
            <div className="mt-6 text-sm text-gray-700 dark:text-gray-300">
              Showing all {artistData.length} search result{artistData.length === 1 ? "" : "s"} for "{searchQuery}"
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
