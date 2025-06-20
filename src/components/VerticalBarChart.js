const VerticalBarChart = ({ songs, formatNumber, generateRandomColor }) => {
  if (!songs || songs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600 h-64 flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400 text-sm">No songs to display</span>
      </div>
    );
  }

  const maxPercentage = Math.max(...songs.map((s) => s.percentage));

  return (
    <div className="bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600">
      <div className="overflow-x-auto">
        <div className="flex items-end gap-0.5 h-64 pt-16 pb-4 px-4 min-w-fit">
          {songs.map((song, songIndex) => {
            const relativeHeight = maxPercentage > 0 ? (song.percentage / maxPercentage) * 100 : 5;
            const barHeight = Math.max(relativeHeight, 2);

            // Tooltip positioning logic
            const totalBars = songs.length;
            const isLeftSide = songIndex < totalBars * 0.25;
            const isRightSide = songIndex > totalBars * 0.75;

            let tooltipClasses;
            if (isLeftSide) {
              tooltipClasses =
                "invisible group-hover:visible absolute bottom-full left-full transform bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 mb-1";
            } else if (isRightSide) {
              tooltipClasses =
                "invisible group-hover:visible absolute bottom-full right-full transform bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 mb-1";
            } else {
              tooltipClasses =
                "invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 mb-1";
            }

            return (
              <div
                key={song.trackId}
                className="group relative"
                style={{
                  height: `${barHeight}%`,
                  minHeight: "4px",
                  width: "8px",
                }}
              >
                <div
                  className={`${generateRandomColor(songIndex)} hover:opacity-80 transition-colors rounded-t cursor-pointer flex-shrink-0 h-full`}
                >
                  <div className={tooltipClasses}>
                    {song.trackName}
                    <br />
                    {song.percentage.toFixed(1)}% of catalog
                    <br />
                    {formatNumber(song.totalPlays)} plays
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2 border-t border-gray-200 dark:border-gray-600">
        Song distribution by percentage (hover bars for details) • {songs.length} songs total
      </div>
    </div>
  );
};

export default VerticalBarChart;
