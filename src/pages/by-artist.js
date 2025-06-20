import { AlertCircle, ChevronDown, ChevronUp, Loader2, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import ArtistCatalogExpansion from "../components/ArtistCatalogExpansion";
import Header from "../components/Header";
import Pagination from "../components/Pagination";
import StackedBarChart from "../components/StackedBarChart";

export default function ByArtistPage() {
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

  const ITEMS_PER_PAGE = 100;

  useEffect(() => {
    fetchArtistData(currentPage);
  }, [currentPage]);

  const fetchArtistData = async (page) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/artists?page=${page}&limit=${ITEMS_PER_PAGE}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();

      setArtistData(data.artists);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching artist data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPageData = () => {
    return artistData; // Data is already paginated from API
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

  const toggleArtistExpansion = async (artistName) => {
    // Toggle expanded state
    const newExpanded = new Set(expandedArtists);
    if (newExpanded.has(artistName)) {
      newExpanded.delete(artistName);
      setExpandedArtists(newExpanded);
      return;
    } else {
      newExpanded.add(artistName);
      setExpandedArtists(newExpanded);
    }

    // If we don't have the detailed song data yet, fetch it
    if (!artistSongs[artistName] && !loadingArtists.has(artistName)) {
      const newLoading = new Set(loadingArtists);
      newLoading.add(artistName);
      setLoadingArtists(newLoading);

      try {
        const response = await fetch(`/api/artist-songs/${encodeURIComponent(artistName)}`);
        if (response.ok) {
          const data = await response.json();
          setArtistSongs((prev) => ({
            ...prev,
            [artistName]: data.songs,
          }));
        }
      } catch (error) {
        console.error(`Error fetching detailed songs for ${artistName}:`, error);
      } finally {
        const updatedLoading = new Set(loadingArtists);
        updatedLoading.delete(artistName);
        setLoadingArtists(updatedLoading);
      }
    }
  };

  const loadPercentagesForArtist = async (artistName) => {
    // If we don't have the percentage data yet, fetch it
    if (!artistPercentages[artistName] && !loadingArtists.has(artistName)) {
      const newLoading = new Set(loadingArtists);
      newLoading.add(artistName);
      setLoadingArtists(newLoading);

      try {
        const response = await fetch(`/api/artist-percentages/${encodeURIComponent(artistName)}`);
        if (response.ok) {
          const data = await response.json();
          setArtistPercentages((prev) => ({
            ...prev,
            [artistName]: data,
          }));
        }
      } catch (error) {
        console.error(`Error fetching percentages for ${artistName}:`, error);
      } finally {
        const updatedLoading = new Set(loadingArtists);
        updatedLoading.delete(artistName);
        setLoadingArtists(updatedLoading);
      }
    }
  };

  // Pre-load percentage data for visible artists
  useEffect(() => {
    if (artistData.length > 0) {
      artistData.forEach((artist) => {
        loadPercentagesForArtist(artist.name);
      });
    }
  }, [artistData]);

  const generateRandomColor = (index) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-gray-500",
      "bg-orange-500",
      "bg-teal-500",
    ];
    return colors[index % colors.length];
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
        <Header title="Aggregate Charts" showBackButton={true} iconColor="text-blue-600 dark:text-blue-400" />
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-300">Loading artist data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Aggregate Charts" showBackButton={true} iconColor="text-blue-600 dark:text-blue-400" />
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => fetchArtistData(currentPage)}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
      <Header title="Charts by Artist" showBackButton={true} iconColor="text-blue-600 dark:text-blue-400" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Top Artists by Total Plays</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Showing {formatNumber(pagination.totalArtists || 0)} artists ranked by total stream count
              </p>
              <div className="mt-4 flex items-center space-x-3">
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
                    className="pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
            <User className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Artist Table */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/50 border-b border-blue-100 dark:border-blue-700">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Page {currentPage} of {pagination.totalPages || 0} ({ITEMS_PER_PAGE} artists per page)
              </h3>
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
                  {getCurrentPageData().map((artist, index) => (
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
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{artist.name}</span>
                            {expandedArtists.has(artist.name) ? (
                              <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
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
                            {artistPercentages[artist.name]?.totalSongs || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap w-64">
                          {/* Stacked Bar Chart Column */}
                          <div className="space-y-2">
                            <StackedBarChart
                              percentages={artistPercentages[artist.name]?.percentages}
                              generateRandomColor={generateRandomColor}
                              isLoading={loadingArtists.has(artist.name)}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-green-600 dark:text-green-400 font-mono">
                            {calculateEstimatedPayout(artist.totalPlays)}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded row with styled song breakdown */}
                      {expandedArtists.has(artist.name) && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-0 py-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                          >
                            <ArtistCatalogExpansion
                              artist={artist}
                              artistSongs={artistSongs}
                              isLoading={loadingArtists.has(artist.name)}
                              formatNumber={formatNumber}
                              generateRandomColor={generateRandomColor}
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

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            pagination={pagination}
            formatNumber={formatNumber}
            goToPage={goToPage}
            getPaginationRange={getPaginationRange}
          />
        </div>
      </main>
    </div>
  );

  // return (
  //   <div className="min-h-screen bg-gray-50">
  //     <Header title="Charts by Artist" showBackButton={true} iconColor="text-blue-600" />

  //     {/* Main Content */}
  //     <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
  //       <div className="text-center">
  //         <User className="mx-auto h-16 w-16 text-blue-600 mb-6" />
  //         <h2 className="text-4xl font-bold text-gray-900 mb-4">Charts by Artist</h2>
  //         <p className="text-lg text-gray-600">Content coming soon...</p>
  //       </div>
  //     </main>
  //   </div>
  // );
}
