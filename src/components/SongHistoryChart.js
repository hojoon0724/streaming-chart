import { BarChart3, Loader2, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SongHistoryChart({ trackId, isOpen, onClose, payoutPerMillion = 5000 }) {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const performanceChartRef = useRef(null);
  const cumulativeChartRef = useRef(null);

  useEffect(() => {
    if (isOpen && trackId) {
      fetchSongHistory();
    }
  }, [isOpen, trackId]);

  const fetchSongHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/song-history/${trackId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.statusText}`);
      }
      const data = await response.json();
      setHistoryData(data);
      console.log("Song history data:", data); // Debug log
    } catch (err) {
      console.error("Error fetching song history:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const calculateEstimatedPayout = (streams) => {
    const millions = streams / 1000000;
    const payout = millions * payoutPerMillion;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(payout);
  };

  const getPositionTrend = (currentPos, previousPos) => {
    if (previousPos === undefined) return null;
    if (currentPos < previousPos) return "up";
    if (currentPos > previousPos) return "down";
    return "same";
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "same":
        return <Minus className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getMaxStreams = () => {
    if (!historyData?.history) return 0;
    return Math.max(...historyData.history.map((h) => h.streams));
  };

  const getBarHeight = (streams) => {
    const maxStreams = getMaxStreams();
    if (maxStreams === 0) return 5; // Fallback minimum height
    const percentage = (streams / maxStreams) * 100;
    return Math.max(percentage, 5); // Minimum 5% height for visibility
  };

  const getCumulativeData = () => {
    if (!historyData?.history) return [];
    let cumulativeTotal = 0;
    return historyData.history.map((entry) => {
      cumulativeTotal += entry.streams;
      return {
        ...entry,
        cumulativeStreams: cumulativeTotal,
      };
    });
  };

  const getMaxCumulativeStreams = () => {
    const cumulativeData = getCumulativeData();
    if (cumulativeData.length === 0) return 0;
    return Math.max(...cumulativeData.map((d) => d.cumulativeStreams));
  };

  const getCumulativeBarHeight = (cumulativeStreams) => {
    const maxCumulative = getMaxCumulativeStreams();
    if (maxCumulative === 0) return 5;
    const percentage = (cumulativeStreams / maxCumulative) * 100;
    return Math.max(percentage, 5);
  };

  // Synchronized scrolling functions
  const handlePerformanceScroll = (e) => {
    if (cumulativeChartRef.current && performanceChartRef.current) {
      cumulativeChartRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const handleCumulativeScroll = (e) => {
    if (performanceChartRef.current && cumulativeChartRef.current) {
      performanceChartRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="m-4 bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-600 rounded-lg p-4 max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">Chart Performance History</h3>
        </div>
        <button
          onClick={onClose}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm"
        >
          Close
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin mr-2" />
          <span className="text-blue-700 dark:text-blue-300">Loading chart history...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchSongHistory}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      )}

      {historyData && (
        <div>
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{historyData.trackName}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              by {historyData.artists.join(", ")} • {historyData.totalWeeks} weeks on charts
            </p>
          </div>

          {/* Chart Visualization */}
          <div className="mb-6">
            <div
              ref={performanceChartRef}
              className="overflow-x-scroll bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600"
              onScroll={handlePerformanceScroll}
            >
              <div className="flex items-end gap-0.5 h-52 pt-12 pl-1">
                {historyData.history.map((entry, index) => {
                  const height = getBarHeight(entry.streams);
                  const totalBars = historyData.history.length;
                  const isLeftSide = index < totalBars * 0.25;
                  const isRightSide = index > totalBars * 0.75;

                  // Determine tooltip position and styling
                  let tooltipClasses, tooltipStyle;
                  if (isLeftSide) {
                    // Left side - tooltip on the right
                    tooltipClasses =
                      "invisible group-hover:visible absolute bottom-full left-full transform bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10";
                  } else if (isRightSide) {
                    // Right side - tooltip on the left
                    tooltipClasses =
                      "invisible group-hover:visible absolute bottom-full right-full transform bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10";
                  } else {
                    // Middle - tooltip on top
                    tooltipClasses =
                      "invisible group-hover:visible absolute bottom-full left-1/2 transform bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10";
                  }

                  return (
                    <div
                      key={index}
                      className="group relative bg-blue-500 hover:bg-blue-600 transition-colors rounded-t cursor-pointer"
                      style={{
                        height: `${height}%`,
                        minHeight: "4px",
                        width: "6px",
                        flexShrink: 0,
                      }}
                    >
                      {/* Tooltip */}
                      <div className={tooltipClasses}>
                        Week {entry.week}: {formatNumber(entry.streams)} streams
                        <br />
                        Position #{entry.position} • {entry.formattedDate}
                        <br />
                        Est. Payout: {calculateEstimatedPayout(entry.streams)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Stream count over time (hover bars for details) • {historyData.totalWeeks} weeks total
            </div>
          </div>

          {/* Cumulative Chart Visualization */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Cumulative Streams Over Time</h4>
            <div
              ref={cumulativeChartRef}
              className="overflow-x-scroll bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600"
              onScroll={handleCumulativeScroll}
            >
              <div className="flex items-end gap-0.5 h-52 pt-12 pl-1">
                {getCumulativeData().map((entry, index) => {
                  const height = getCumulativeBarHeight(entry.cumulativeStreams);
                  const totalBars = getCumulativeData().length;
                  const isLeftSide = index < totalBars * 0.25;
                  const isRightSide = index > totalBars * 0.75;

                  // Determine tooltip position and styling
                  let tooltipClasses;
                  if (isLeftSide) {
                    // Left side - tooltip on the right
                    tooltipClasses =
                      "invisible group-hover:visible absolute bottom-full left-full transform bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10";
                  } else if (isRightSide) {
                    // Right side - tooltip on the left
                    tooltipClasses =
                      "invisible group-hover:visible absolute bottom-full right-full transform bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10";
                  } else {
                    // Middle - tooltip on top
                    tooltipClasses =
                      "invisible group-hover:visible absolute bottom-full left-1/2 transform bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10";
                  }

                  return (
                    <div
                      key={index}
                      className="group relative bg-green-500 hover:bg-green-600 transition-colors rounded-t cursor-pointer"
                      style={{
                        height: `${height}%`,
                        minHeight: "4px",
                        width: "6px",
                        flexShrink: 0,
                      }}
                    >
                      {/* Tooltip */}
                      <div className={tooltipClasses}>
                        Week {entry.week}: {formatNumber(entry.cumulativeStreams)} total streams
                        <br />
                        Weekly: {formatNumber(entry.streams)} streams
                        <br />
                        Cumulative Payout: {calculateEstimatedPayout(entry.cumulativeStreams)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Cumulative streams over time (hover bars for details) • Total: {formatNumber(getMaxCumulativeStreams())}{" "}
              streams
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
