import { AlertCircle, Calendar, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import WeekMatrix from "../components/WeekMatrix";
import WeeklyChartDisplay from "../components/WeeklyChartDisplay";

export default function ByDatePage() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payoutPerMillion, setPayoutPerMillion] = useState(5000);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedWeekData, setSelectedWeekData] = useState(null);

  useEffect(() => {
    loadAvailableDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadWeekData(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableDates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all available dates using the dedicated endpoint
      const response = await fetch("/api/available-dates");
      if (!response.ok) {
        throw new Error(`Failed to load available dates: ${response.statusText}`);
      }
      const data = await response.json();

      if (data.availableDates) {
        setAvailableDates(data.availableDates);
        setChartData({ metadata: data.metadata }); // Set metadata for display

        // Set the most recent date as default
        if (data.availableDates.length > 0) {
          setSelectedDate(data.availableDates[data.availableDates.length - 1]);
        }
      }
    } catch (err) {
      console.error("Error loading available dates:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadWeekData = async (date) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/charts?dateFrom=${date}&dateTo=${date}`);
      if (!response.ok) {
        throw new Error(`Failed to load week data: ${response.statusText}`);
      }
      const data = await response.json();

      if (data.charts && data.charts[date]) {
        setSelectedWeekData(data.charts[date]);
        setChartData(data);
      } else {
        setSelectedWeekData([]);
      }
    } catch (err) {
      console.error("Error loading week data:", err);
      setError(err.message);
      setSelectedWeekData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header
          title="Charts by Date"
          showBackButton={true}
          iconColor="text-yellow-600 dark:text-yellow-400"
          showPayoutSetting={true}
          payoutPerMillion={payoutPerMillion}
          onPayoutChange={setPayoutPerMillion}
        />
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="mx-auto h-16 w-16 text-yellow-600 dark:text-yellow-400 mb-6 animate-spin" />
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
        <Header
          title="Charts by Date"
          showBackButton={true}
          iconColor="text-yellow-600 dark:text-yellow-400"
          showPayoutSetting={true}
          payoutPerMillion={payoutPerMillion}
          onPayoutChange={setPayoutPerMillion}
        />
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-600 dark:text-red-400 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Error Loading Data</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={loadAvailableDates}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
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
        title="Charts by Date"
        showBackButton={true}
        iconColor="text-yellow-600 dark:text-yellow-400"
        showPayoutSetting={true}
        payoutPerMillion={payoutPerMillion}
        onPayoutChange={setPayoutPerMillion}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Weekly Chart Explorer</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Select a week from the matrix below to view that week's charts and estimated earnings
              </p>
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

          <div className="space-y-6">
            {/* Week Matrix Section */}
            <WeekMatrix availableDates={availableDates} selectedDate={selectedDate} onDateSelect={setSelectedDate} />

            {/* Chart Display Section */}
            <WeeklyChartDisplay
              weekData={selectedWeekData}
              selectedDate={selectedDate}
              payoutPerMillion={payoutPerMillion}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
