import { User } from "lucide-react";
import { AlertCircle, BarChart3, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "../components/Header";

export default function ByArtistPage() {
    const [artistData, setArtistData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

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
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Artist Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Plays
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {getCurrentPageData().map((artist, index) => (
                      <tr key={artist.name} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">#{artist.rank}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{artist.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">{formatNumber(artist.totalPlays)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
  
            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <span>
                  Showing {pagination.startIndex || 0} to {pagination.endIndex || 0} of{" "}
                  {formatNumber(pagination.totalArtists || 0)} artists
                </span>
              </div>
  
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          ? "bg-blue-600 dark:bg-blue-500 text-white"
                          : page === "..."
                            ? "text-gray-400 dark:text-gray-500 cursor-default"
                            : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
  
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
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
