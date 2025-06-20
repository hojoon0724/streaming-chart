import { Calendar, Pause, Play, SkipBack, SkipForward, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const WeeklyEarningsRibbon = ({ chartData, payoutPerMillion = 5000 }) => {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000);
  const [showTopN, setShowTopN] = useState(20);

  const calculateEstimatedPayout = (totalStreams) => {
    const millions = totalStreams / 1000000;
    const payout = millions * payoutPerMillion;
    return payout;
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

  // Get sorted weeks for column headers
  const sortedWeeks = useMemo(() => {
    if (!chartData || !chartData.charts) return [];
    return Object.keys(chartData.charts).sort();
  }, [chartData]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentWeekIndex((prev) => {
        if (prev >= sortedWeeks.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, sortedWeeks.length]);

  // Process data to aggregate by track and week
  const processedData = useMemo(() => {
    if (!chartData || !chartData.charts) return [];

    const trackData = {};

    // Aggregate data by track
    Object.entries(chartData.charts).forEach(([date, tracks]) => {
      tracks.forEach((track) => {
        const key = track.track_id;
        if (!trackData[key]) {
          trackData[key] = {
            trackId: track.track_id,
            trackName: track.track_name,
            artists: track.artists,
            weeklyData: {},
            totalStreams: 0,
            totalEarnings: 0,
            weekCount: 0,
            color: `hsl(${Math.floor(Math.random() * 360)}, 45%, 55%)`,
          };
        }

        // Add weekly data
        trackData[key].weeklyData[date] = {
          streams: track.streams,
          position: track.position,
          earnings: calculateEstimatedPayout(track.streams),
        };

        trackData[key].totalStreams += track.streams;
        trackData[key].totalEarnings += calculateEstimatedPayout(track.streams);
        trackData[key].weekCount += 1;
      });
    });

    return Object.values(trackData);
  }, [chartData, payoutPerMillion]);

  // Get current week's data for ribbon display
  const currentWeekData = useMemo(() => {
    if (!sortedWeeks.length || currentWeekIndex >= sortedWeeks.length) return [];

    const currentWeek = sortedWeeks[currentWeekIndex];
    const weekTracks = chartData.charts[currentWeek] || [];

    // Sort by position and take top N
    return weekTracks
      .sort((a, b) => a.position - b.position)
      .slice(0, showTopN)
      .map((track) => {
        const trackInfo = processedData.find((t) => t.trackId === track.track_id);
        return {
          ...track,
          color: trackInfo?.color || `hsl(${Math.floor(Math.random() * 360)}, 45%, 55%)`,
          earnings: calculateEstimatedPayout(track.streams),
          trackName: track.track_name,
          artists: track.artists,
        };
      });
  }, [sortedWeeks, currentWeekIndex, chartData, showTopN, processedData]);

  // Get previous week's data for comparison
  const previousWeekData = useMemo(() => {
    if (currentWeekIndex === 0) return [];

    const previousWeek = sortedWeeks[currentWeekIndex - 1];
    const weekTracks = chartData.charts[previousWeek] || [];

    return weekTracks.sort((a, b) => a.position - b.position).slice(0, showTopN);
  }, [sortedWeeks, currentWeekIndex, chartData, showTopN]);

  // Calculate position changes
  const getPositionChange = (trackId) => {
    if (currentWeekIndex === 0) return 0;

    const currentTrack = currentWeekData.find((t) => t.track_id === trackId);
    const previousTrack = previousWeekData.find((t) => t.track_id === trackId);

    if (!currentTrack) return 0;
    if (!previousTrack) return -999; // New entry

    return previousTrack.position - currentTrack.position;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    setCurrentWeekIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentWeekIndex((prev) => Math.min(sortedWeeks.length - 1, prev + 1));
  };

  const handleWeekChange = (index) => {
    setCurrentWeekIndex(index);
    setIsPlaying(false);
  };

  if (!chartData || !chartData.charts) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <span className="text-gray-500 dark:text-gray-400">No chart data available</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Show top:</label>
              <select
                value={showTopN}
                onChange={(e) => setShowTopN(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Speed:</label>
              <select
                value={playSpeed}
                onChange={(e) => setPlaySpeed(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value={2000}>Slow</option>
                <option value={1000}>Normal</option>
                <option value={500}>Fast</option>
                <option value={250}>Very Fast</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Payout: ${payoutPerMillion.toLocaleString()}/M streams
              </span>
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handlePrevious}
            disabled={currentWeekIndex === 0}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipBack className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handlePlayPause}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={handleNext}
            disabled={currentWeekIndex >= sortedWeeks.length - 1}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Week Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Week:{" "}
              {sortedWeeks[currentWeekIndex]
                ? new Date(sortedWeeks[currentWeekIndex]).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Loading..."}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {currentWeekIndex + 1} of {sortedWeeks.length}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={sortedWeeks.length - 1}
            value={currentWeekIndex}
            onChange={(e) => handleWeekChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Ribbon Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Chart Rankings - Week of{" "}
            {sortedWeeks[currentWeekIndex]
              ? new Date(sortedWeeks[currentWeekIndex]).toLocaleDateString()
              : "Loading..."}
          </h3>

          <div className="space-y-2">
            {currentWeekData.map((track, index) => {
              const positionChange = getPositionChange(track.track_id);
              const isNew = positionChange === -999;
              const isRising = positionChange > 0;
              const isFalling = positionChange < 0 && !isNew;

              return (
                <div
                  key={track.track_id}
                  className="relative flex items-center p-4 rounded-lg transition-all duration-500 transform hover:scale-[1.01] border border-gray-200 dark:border-gray-700"
                  style={{
                    backgroundColor: `${track.color}08`,
                    borderLeftColor: track.color,
                    borderLeftWidth: "3px",
                  }}
                >
                  {/* Position */}
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm mr-4 border-2"
                    style={{
                      backgroundColor: track.color,
                      borderColor: `${track.color}40`,
                    }}
                  >
                    {track.position}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {track.trackName}
                        </h4>
                        <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                          {Array.isArray(track.artists) ? track.artists.join(", ") : track.artists}
                        </p>
                      </div>

                      {/* Position Change Indicator */}
                      <div className="flex items-center gap-2">
                        {isNew && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 text-xs font-medium rounded-full border border-blue-300 dark:border-blue-700">
                            NEW
                          </span>
                        )}
                        {isRising && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 text-xs font-medium rounded-full border border-green-300 dark:border-green-700">
                            ↑ {positionChange}
                          </span>
                        )}
                        {isFalling && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 text-xs font-medium rounded-full border border-red-300 dark:border-red-700">
                            ↓ {Math.abs(positionChange)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right ml-4">
                    <div className="text-base font-bold text-green-800 dark:text-green-200">
                      {formatCurrency(track.earnings)}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {formatNumber(track.streams)} streams
                    </div>
                  </div>

                  {/* Subtle ribbon effect */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-500 rounded-r-sm"
                    style={{
                      backgroundColor: track.color,
                      opacity: 0.7,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-800 dark:text-gray-200">Week Total Revenue</div>
          <div className="text-2xl font-bold text-green-800 dark:text-green-200">
            {formatCurrency(currentWeekData.reduce((sum, track) => sum + track.earnings, 0))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-800 dark:text-gray-200">Total Streams</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(currentWeekData.reduce((sum, track) => sum + track.streams, 0))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-800 dark:text-gray-200">New Entries</div>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
            {currentWeekData.filter((track) => getPositionChange(track.track_id) === -999).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-800 dark:text-gray-200">Avg. Position</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentWeekData.length > 0
              ? Math.round(currentWeekData.reduce((sum, track) => sum + track.position, 0) / currentWeekData.length)
              : 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyEarningsRibbon;
