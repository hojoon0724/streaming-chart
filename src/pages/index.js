import { Calendar, Music, User } from "lucide-react";
import { useRouter } from "next/router";
import Header from "../components/Header";

export default function HomePage() {
  const router = useRouter();

  const navigateToArtist = () => {
    router.push("/by-artist");
  };

  const navigateToDate = () => {
    router.push("/by-date");
  };

  const navigateToAggregate = () => {
    router.push("/by-song");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Streams Chart Dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            This is only from Spotify's top charts data
          </h2>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Counts do not include time spent outside the weekly chart
          </h2>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Accurate payouts are unknown</h2>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            We estimate it to be around $5,000 per million
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-800 dark:text-gray-200">
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 pt-3 pb-4 text-left">
              <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-2">Source</h2>
              <ul class="space-y-1">
                <li>
                  <strong>Platform:</strong> <span class="text-blue-700 dark:text-blue-300">Spotify</span>
                </li>
                <li>
                  <strong>Market share:</strong> ~<span class="text-pink-700 dark:text-pink-300">30%</span>
                </li>
                <li>
                  <strong>Total entries:</strong> <span class="text-green-700 dark:text-green-300">88,462</span>
                </li>
                <li>
                  <strong>Unique dates:</strong> <span class="text-green-700 dark:text-green-300">494</span>
                </li>
              </ul>
            </div>

            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 pt-3 pb-4 text-left">
              <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-2">Time Range</h2>
              <ul class="space-y-1">
                <li>
                  <strong>Beginning:</strong> <span class="text-yellow-700 dark:text-yellow-300">2013/09/29</span>
                </li>
                <li>
                  <strong>Ending:</strong> <span class="text-yellow-700 dark:text-yellow-300">2023/04/06</span>
                </li>
              </ul>
            </div>

            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 pt-3 pb-4 text-left">
              <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-2">Chart Coverage</h2>
              <ul class="space-y-1">
                <li>
                  <strong>Before 2014/10/26:</strong> Top 50
                </li>
                <li>
                  <strong>After 2014/10/26:</strong> Top 200
                </li>
              </ul>
            </div>

            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 pt-3 pb-4 text-left">
              <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-2">Payout Estimate</h2>
              <ul class="space-y-1">
                <li>
                  <strong>Spotify:</strong> <span class="text-indigo-700 dark:text-indigo-300">$5,000/M</span>
                </li>
                <li>
                  <strong>Other platforms:</strong> Up to{" "}
                  <span class="text-indigo-800 dark:text-indigo-200">$10,000/M</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* By Artist Button */}
          <button
            onClick={navigateToArtist}
            className="group bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <div className="flex flex-col items-center text-center">
              <User className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">By Artist</h3>
            </div>
          </button>

          {/* By Date Button */}
          <button
            onClick={navigateToDate}
            className="group bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <div className="flex flex-col items-center text-center">
              <Calendar className="h-12 w-12 text-green-600 dark:text-green-400 mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">By Date</h3>
            </div>
          </button>

          {/* Aggregate Button */}
          <button
            onClick={navigateToAggregate}
            className="group bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <div className="flex flex-col items-center text-center">
              <Music className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">By Song</h3>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
