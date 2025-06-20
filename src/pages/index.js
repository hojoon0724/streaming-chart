import { BarChart3, Calendar, User,Music } from "lucide-react";
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
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Choose Your View</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">Select how you'd like to explore the streaming charts</p>
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
