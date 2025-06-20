import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, pagination, formatNumber, goToPage, getPaginationRange }) => {
  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
        <span>
          Showing {pagination.startIndex || 0} to {pagination.endIndex || 0} of{" "}
          {formatNumber(pagination.totalArtists || 0)} artists
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </button>

        <div className="flex items-center space-x-1">
          {getPaginationRange().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && goToPage(page)}
              disabled={page === "..."}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === currentPage
                  ? "bg-blue-600 dark:bg-blue-500 text-white"
                  : page === "..."
                    ? "text-gray-400 dark:text-gray-500 cursor-default"
                    : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
