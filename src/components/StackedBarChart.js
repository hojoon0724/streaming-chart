import { Loader2 } from "lucide-react";

const StackedBarChart = ({ percentages, generateRandomColor, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-6 bg-gray-200 dark:bg-gray-700 rounded">
        <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!percentages || percentages.length === 0) {
    return (
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex w-full h-6 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
      {percentages.map((percentage, songIndex) => (
        <div
          key={songIndex}
          className={`${generateRandomColor(songIndex)} h-full`}
          style={{ width: `${percentage}%` }}
          title={`Song ${songIndex + 1} - ${percentage.toFixed(1)}%`}
        />
      ))}
    </div>
  );
};

export default StackedBarChart;
