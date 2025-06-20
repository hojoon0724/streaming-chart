import { ArrowLeft, Music } from "lucide-react";
import { useRouter } from "next/router";

export default function Header({ title, showBackButton = false, backPath = "/home", iconColor = "text-blue-600" }) {
  const router = useRouter();

  const goBack = () => {
    router.push(backPath);
  };

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {showBackButton && (
              <button
                onClick={goBack}
                className="mr-4 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <Music className={`h-8 w-8 ${iconColor} mr-3`} />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-white dark:focus:ring-offset-gray-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
