import { Calendar, Music, User } from "lucide-react";
import { useRouter } from "next/router";
import Header from "../components/Header";

export default function HomePage() {
  const router = useRouter();

  const navigateToArtist = () => {
    router.push("/by-artist");
  };

  const navigateToWeek = () => {
    router.push("/by-date");
  };

  const navigateToAggregate = () => {
    router.push("/by-song");
  };

  const navigateToAggregateArtist = () => {
    router.push("/aggregate-artist");
  };

  const navigateToAggregateSong = () => {
    router.push("/aggregate-song");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Streams Chart Dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 gap-6 flex flex-col">
        <div className="weekly-container border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-100 dark:bg-gray-950 flex flex-col gap-6">
          <div className="section-text px-4">
            <h2 className="text-2xl font-bold ">Current Cumulative Totals</h2>
            <p className="text-lg">
              <b>Most up-to-date</b> totals. No weekly breakdown.
            </p>
          </div>
          <div className="text-center">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 text-sm text-gray-800 dark:text-gray-200 px-4 pt-2 pb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ">
              <div class="text-left">
                <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-2">Source</h2>
                <ul class="space-y-1">
                  <li>
                    <strong className="text-black dark:text-gray-400">Platform:</strong>{" "}
                    <span class="text-blue-700 dark:text-blue-300">Spotify</span>
                  </li>
                  <li>
                    <strong className="text-black dark:text-gray-400">Market share:</strong> ~
                    <span class="text-pink-700 dark:text-pink-300">30%</span>
                  </li>
                  <li>
                    <strong className="text-black dark:text-gray-400">Total songs:</strong>{" "}
                    <span class="text-green-700 dark:text-green-300">11,139</span>
                  </li>
                </ul>
              </div>

              <div class="text-left">
                <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-2">Time Range</h2>
                <ul class="space-y-1">
                  <li>
                    <strong className="text-black dark:text-gray-400">Beginning:</strong>{" "}
                    <span class="text-yellow-700 dark:text-yellow-300">2014/08/10</span>
                  </li>
                  <li>
                    <strong className="text-black dark:text-gray-400">Ending:</strong>{" "}
                    <span class="text-yellow-700 dark:text-yellow-300">2025/06/19</span>
                  </li>
                </ul>
              </div>

              {/* <div class="text-left">
                <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-2">Chart Coverage</h2>
                <ul class="space-y-1">
                  <li>
                    <strong className="text-black dark:text-gray-400">Before 2014/10/26:</strong> Top 50
                  </li>
                  <li>
                    <strong className="text-black dark:text-gray-400">After 2014/10/26:</strong> Top 200
                  </li>
                </ul>
              </div> */}

              <div class="text-left">
                <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-2">Payout Estimate</h2>
                <ul class="space-y-1">
                  <li>
                    <strong className="text-black dark:text-gray-400">Spotify:</strong>{" "}
                    <span class="text-indigo-700 dark:text-indigo-300">$5,000/M</span>
                  </li>
                  <li>
                    <strong className="text-black dark:text-gray-400">Other platforms:</strong> Up to{" "}
                    <span class="text-indigo-700 dark:text-indigo-300">$10,000/M</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Aggregate Artist Button */}
            <button
              onClick={navigateToAggregateArtist}
              className="group p-3 rounded-lg hover:shadow-sm transition-all duration-200 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer bg-blue-600 dark:bg-blue-400 hover:scale-105"
            >
              <div className="flex flex-row justify-center items-center text-center gap-4">
                <User className="h-12 w-12 text-gray-100 dark:text-gray-900 " />
                <h3 className="text-xl font-semibold text-gray-200 dark:text-gray-900">By Artist</h3>
              </div>
            </button>

            {/* Aggregate Song Button */}
            <button
              onClick={navigateToAggregateSong}
              className="group p-3 rounded-lg hover:shadow-sm transition-all duration-200 border-2 border-gray-200 dark:border-gray-700 hover:border-slate-500 dark:hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer bg-slate-600 dark:bg-slate-400 hover:scale-105"
            >
              <div className="flex flex-row justify-center items-center text-center gap-4">
                <Music className="h-12 w-12 text-gray-100 dark:text-gray-900 " />
                <h3 className="text-xl font-semibold text-gray-200 dark:text-gray-900">By Song</h3>
              </div>
            </button>
          </div>
        </div>
        <div className="weekly-container border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-100 dark:bg-gray-950 flex flex-col gap-6">
          <div className="section-text px-4">
            <h2 className="text-2xl font-bold ">Historical Weekly Breakdown</h2>
            <p className="text-lg">
              <b>Week-by-week data</b> through the end of 2023. Shows trends over time.
            </p>
          </div>
          <div className="text-center">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 text-sm text-gray-800 dark:text-gray-200 px-4 pt-2 pb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ">
              <div class="text-left">
                <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-2">Source</h2>
                <ul class="space-y-1">
                  <li>
                    <strong className="text-black dark:text-gray-400">Platform:</strong>{" "}
                    <span class="text-blue-700 dark:text-blue-300">Spotify</span>
                  </li>
                  <li>
                    <strong className="text-black dark:text-gray-400">Market share:</strong> ~
                    <span class="text-pink-700 dark:text-pink-300">30%</span>
                  </li>
                  <li>
                    <strong className="text-black dark:text-gray-400">Total songs:</strong>{" "}
                    <span class="text-green-700 dark:text-green-300">6,199</span>
                  </li>
                </ul>
              </div>

              <div class="text-left">
                <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-2">Time Range</h2>
                <ul class="space-y-1">
                  <li>
                    <strong className="text-black dark:text-gray-400">Beginning:</strong>{" "}
                    <span class="text-yellow-700 dark:text-yellow-300">2013/09/29</span>
                  </li>
                  <li>
                    <strong className="text-black dark:text-gray-400">Ending:</strong>{" "}
                    <span class="text-yellow-700 dark:text-yellow-300">2023/04/06</span>
                  </li>
                  <li>
                    <strong className="text-black dark:text-gray-400">Unique weeks</strong>{" "}
                    <span class="text-green-700 dark:text-green-300">494</span>
                  </li>
                </ul>
              </div>

              <div class="text-left">
                <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-2">Chart Coverage</h2>
                <ul class="space-y-1">
                  <li>
                    <strong className="text-black dark:text-gray-400">Before 2014/10/26:</strong> Top 50
                  </li>
                  <li>
                    <strong className="text-black dark:text-gray-400">After 2014/10/26:</strong> Top 200
                  </li>
                </ul>
              </div>

              <div class="text-left">
                <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-2">Payout Estimate</h2>
                <ul class="space-y-1">
                  <li>
                    <strong className="text-black dark:text-gray-400">Spotify:</strong>{" "}
                    <span class="text-indigo-700 dark:text-indigo-300">$5,000/M</span>
                  </li>
                  <li>
                    <strong className="text-black dark:text-gray-400">Other platforms:</strong> Up to{" "}
                    <span class="text-indigo-700 dark:text-indigo-300">$10,000/M</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* By Artist Button */}
            <button
              onClick={navigateToArtist}
              className="group p-3 rounded-lg hover:shadow-sm transition-all duration-200 border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer bg-red-600 dark:bg-red-400 hover:scale-105"
            >
              <div className="flex flex-row justify-center items-center text-center gap-4">
                <User className="h-12 w-12 text-gray-100 dark:text-gray-900 " />
                <h3 className="text-xl font-semibold text-gray-200 dark:text-gray-900">By Artist</h3>
              </div>
            </button>

            {/* By Week Button */}
            <button
              onClick={navigateToWeek}
              className="group p-3 rounded-lg hover:shadow-sm transition-all duration-200 border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-500 dark:hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer bg-yellow-600 dark:bg-yellow-400 hover:scale-105"
            >
              <div className="flex flex-row justify-center items-center text-center gap-4">
                <Calendar className="h-12 w-12 text-gray-100 dark:text-gray-900 " />
                <h3 className="text-xl font-semibold text-gray-200 dark:text-gray-900">By Week</h3>
              </div>
            </button>

            {/* Aggregate Button */}
            <button
              onClick={navigateToAggregate}
              className="group p-3 rounded-lg hover:shadow-sm transition-all duration-200 border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer bg-green-600 dark:bg-green-400 hover:scale-105"
            >
              <div className="flex flex-row justify-center items-center text-center gap-4">
                <Music className="h-12 w-12 text-gray-100 dark:text-gray-900 " />
                <h3 className="text-xl font-semibold text-gray-200 dark:text-gray-900">By Song</h3>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
