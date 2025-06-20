const SongPerformanceTable = ({ songs, formatNumber, generateRandomColor, calculateEstimatedPayout }) => {
  if (!songs || songs.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-gray-500 dark:text-gray-400">No songs to display</span>
      </div>
    );
  }

  const maxPlays = Math.max(...songs.map((s) => s.totalPlays));

  return (
    <div className="max-h-96 overflow-y-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Song Title
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Plays
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-64">
              Portion of Catalog
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Est. Payout
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
          {songs.map((song, songIndex) => {
            const normalizedPercentage = (song.totalPlays / maxPlays) * 100;

            return (
              <tr
                key={song.trackId}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150"
              >
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">
                    {song.trackName}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-100 font-mono font-semibold">
                    {formatNumber(song.totalPlays)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className={`h-full ${generateRandomColor(songIndex)} transition-all duration-300 ease-out`}
                        style={{ width: `${normalizedPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-14 text-right">
                      {song.percentage.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-green-600 dark:text-green-400 font-mono font-semibold">
                    {calculateEstimatedPayout(song.totalPlays)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SongPerformanceTable;
