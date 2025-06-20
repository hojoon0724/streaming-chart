import { Clock, TrendingUp, Users } from "lucide-react";

const WeeklyChartDisplay = ({ weekData, selectedDate, payoutPerMillion = 5000 }) => {
  if (!weekData || weekData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No chart data available</h3>
        <p className="text-gray-500 dark:text-gray-400">Select a date with available data to view charts.</p>
      </div>
    );
  }

  // Deduplicate tracks by track_id and position, keeping the one with higher streams
  const deduplicatedData = weekData.reduce((acc, track) => {
    const key = `${track.track_id}-${track.position}`;
    const existing = acc.get(key);
    
    if (!existing || track.streams > existing.streams) {
      acc.set(key, track);
    }
    
    return acc;
  }, new Map());

  const processedWeekData = Array.from(deduplicatedData.values())
    .sort((a, b) => a.position - b.position);

  const calculateEstimatedPayout = (streams) => {
    const millions = streams / 1000000;
    return millions * payoutPerMillion;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const totalStreams = processedWeekData.reduce((sum, track) => sum + track.streams, 0);
  const totalEarnings = processedWeekData.reduce((sum, track) => sum + calculateEstimatedPayout(track.streams), 0);

  return (
    <div className="space-y-6">
      {/* Week Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Week of {selectedDate}</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">Top {processedWeekData.length} tracks</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Streams</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatNumber(totalStreams)}</div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">Est. Total Earnings</span>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{formatCurrency(totalEarnings)}</div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Avg. per Track</span>
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {formatCurrency(totalEarnings / processedWeekData.length)}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Weekly Charts</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Track
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Artist(s)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Streams
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Est. Earnings
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {processedWeekData.map((track, index) => (
                <tr key={`${track.track_id}-${track.position}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold
                        bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300
                      `}
                      >
                        {track.position}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {track.track_name}
                    </div>
                    
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {track.artists.join(", ")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                      {formatNumber(track.streams)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600 dark:text-green-400 text-right">
                      {formatCurrency(calculateEstimatedPayout(track.streams))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChartDisplay;
