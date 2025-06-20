import { AlertCircle, Calendar, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import WeeklyEarningsRibbon from "../components/WeeklyEarningsTable";

export default function ByDatePage() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payoutPerMillion, setPayoutPerMillion] = useState(5000);
  const [dataLimit, setDataLimit] = useState(50);

  useEffect(() => {
    loadChartData();
  }, [dataLimit]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load a limited dataset for better performance
      const response = await fetch(`/api/charts?limit=${dataLimit}`);
      if (!response.ok) {
        throw new Error(`Failed to load chart data: ${response.statusText}`);
      }
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      console.error("Error loading chart data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Charts by Date" showBackButton={true} iconColor="text-green-600 dark:text-green-400" />
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="mx-auto h-16 w-16 text-green-600 dark:text-green-400 mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Loading Chart Data...</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Please wait while we process the data</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Charts by Date" showBackButton={true} iconColor="text-green-600 dark:text-green-400" />
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-600 dark:text-red-400 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Error Loading Data</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={loadChartData}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
      <Header title="Charts by Date" showBackButton={true} iconColor="text-green-600 dark:text-green-400" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Weekly Track Earnings</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Breakdown of estimated revenue per track by week
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Weeks to load:</label>
                <select
                  value={dataLimit}
                  onChange={(e) => setDataLimit(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value={25}>25 weeks</option>
                  <option value={50}>50 weeks</option>
                  <option value={100}>100 weeks</option>
                  <option value={200}>200 weeks</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payout per million streams:
                </label>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    value={payoutPerMillion}
                    onChange={(e) => setPayoutPerMillion(Number(e.target.value))}
                    className="w-20 px-2 py-1 ml-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    min="0"
                    step="100"
                  />
                </div>
              </div>
            </div>
          </div>

          {chartData && chartData.metadata && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Dataset Information</h3>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <div>
                      Date range: {chartData.metadata.date_range.start} to {chartData.metadata.date_range.end}
                    </div>
                    <div>Total entries: {chartData.metadata.total_entries.toLocaleString()}</div>
                    <div>Unique dates: {chartData.metadata.unique_dates}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <WeeklyEarningsRibbon chartData={chartData} payoutPerMillion={payoutPerMillion} />
        </div>
      </main>
    </div>
  );
}
