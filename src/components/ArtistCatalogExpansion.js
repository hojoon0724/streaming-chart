import { AlertCircle, Loader2 } from "lucide-react";
import SongPerformanceTable from "./SongPerformanceTable";
import VerticalBarChart from "./VerticalBarChart";

const ArtistCatalogExpansion = ({
  artist,
  artistSongs,
  isLoading,
  formatNumber,
  generateRandomColor,
  calculateEstimatedPayout,
}) => {
  const songs = artistSongs[artist.name];

  return (
    <div className="px-6 py-6 border-l-4 border-blue-500 dark:border-blue-400">
      <div className="space-y-6">
        {/* Artist Header */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{artist.name}'s Catalog</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Complete breakdown of all songs and their performance
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{songs?.length || 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Songs</div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mr-3" />
            <span className="text-gray-600 dark:text-gray-300">Loading song details...</span>
          </div>
        ) : songs ? (
          <>
            {/* Vertical Catalog Distribution Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Catalog Distribution Overview
                </h5>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <VerticalBarChart
                    songs={songs}
                    formatNumber={formatNumber}
                    generateRandomColor={generateRandomColor}
                  />
                </div>
              </div>
            </div>

            {/* Song Performance Breakdown Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Song Performance Breakdown
                </h5>
              </div>
              <SongPerformanceTable
                songs={songs}
                formatNumber={formatNumber}
                generateRandomColor={generateRandomColor}
                calculateEstimatedPayout={calculateEstimatedPayout}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-red-500 dark:text-red-400 mb-2">
              <AlertCircle className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Failed to load song details</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Please try expanding the artist again</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistCatalogExpansion;
