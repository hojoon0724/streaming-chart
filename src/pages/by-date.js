import { Calendar } from "lucide-react";
import Header from "../components/Header";

export default function ByDatePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Charts by Date" showBackButton={true} iconColor="text-green-600 dark:text-green-400" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Calendar className="mx-auto h-16 w-16 text-green-600 dark:text-green-400 mb-6" />
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Charts by Date</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">Content coming soon...</p>
        </div>
      </main>
    </div>
  );
}
