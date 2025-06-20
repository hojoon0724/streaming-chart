import { useMemo } from "react";

const WeekMatrix = ({ availableDates, selectedDate, onDateSelect }) => {
  // Process available dates to organize by year and week
  const yearWeekData = useMemo(() => {
    if (!availableDates || availableDates.length === 0) return {};

    const dataByYear = {};

    availableDates.forEach((dateStr) => {
      if (!dateStr || typeof dateStr !== "string") return; // Skip invalid dates

      const parts = dateStr.split("/");
      if (parts.length !== 3) return; // Skip malformed dates

      const [year, month, day] = parts.map(Number);

      // Validate the parsed numbers
      if (isNaN(year) || isNaN(month) || isNaN(day)) return;
      if (year < 1900 || year > 2100) return; // Reasonable year range
      if (month < 1 || month > 12) return;
      if (day < 1 || day > 31) return;

      const date = new Date(year, month - 1, day);

      // Validate the date object
      if (isNaN(date.getTime())) return;

      // Calculate week number (ISO week)
      const weekNum = getISOWeekNumber(date);

      if (isNaN(weekNum)) return; // Skip if week calculation failed

      if (!dataByYear[year]) {
        dataByYear[year] = new Set();
      }

      dataByYear[year].add(weekNum);
    });

    // Convert sets to sorted arrays
    const result = {};
    Object.keys(dataByYear).forEach((year) => {
      const yearNum = Number(year);
      if (!isNaN(yearNum)) {
        result[yearNum] = Array.from(dataByYear[year]).sort((a, b) => a - b);
      }
    });
    return result;
  }, [availableDates]);

  // Get ISO week number
  function getISOWeekNumber(date) {
    const tempDate = new Date(date.getTime());
    tempDate.setHours(0, 0, 0, 0);
    tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
    const week1 = new Date(tempDate.getFullYear(), 0, 4);
    return 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  }

  // Find a date string for a given year and week
  const findDateForWeek = (year, weekNum) => {
    return availableDates.find((dateStr) => {
      const [dateYear, month, day] = dateStr.split("/").map(Number);
      if (dateYear !== year) return false;

      const date = new Date(dateYear, month - 1, day);
      const dateWeekNum = getISOWeekNumber(date);
      return dateWeekNum === weekNum;
    });
  };

  const handleWeekClick = (year, weekNum) => {
    const dateStr = findDateForWeek(year, weekNum);
    if (dateStr) {
      onDateSelect(dateStr);
    }
  };

  // Get the start and end date of a week
  const getWeekDateRange = (year, weekNum) => {
    const dateStr = findDateForWeek(year, weekNum);
    if (!dateStr) return { startDate: "", endDate: "" };

    const [dateYear, month, day] = dateStr.split("/").map(Number);
    const date = new Date(dateYear, month - 1, day);

    // Find the start of the week (Monday)
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startDate = new Date(date.setDate(diff));

    // End of week (Sunday)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const formatDate = (d) => {
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${month}/${day}`;
    };

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  };

  const isWeekSelected = (year, weekNum) => {
    if (!selectedDate) return false;
    const [selectedYear, selectedMonth, selectedDay] = selectedDate.split("/").map(Number);
    if (selectedYear !== year) return false;

    const selectedDateObj = new Date(selectedYear, selectedMonth - 1, selectedDay);
    const selectedWeekNum = getISOWeekNumber(selectedDateObj);
    return selectedWeekNum === weekNum;
  };

  const availableYears = Object.keys(yearWeekData)
    .map(Number)
    .filter((year) => !isNaN(year) && year > 0)
    .sort();

  // Create a complete grid showing all 52 weeks for all years
  const createWeekGrid = () => {
    const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

    return availableYears.map((year) => {
      const availableWeeks = yearWeekData[year] || [];
      const weekButtons = weeks.map((weekNum) => {
        const hasData = availableWeeks.includes(weekNum);
        const { startDate, endDate } = hasData ? getWeekDateRange(year, weekNum) : { startDate: "", endDate: "" };

        return (
          <button
            key={`${year}-${weekNum}`}
            onClick={() => hasData && handleWeekClick(year, weekNum)}
            disabled={!hasData}
            title={hasData ? `${startDate} - ${endDate}` : `Week ${weekNum}: No data`}
            className={`
              w-4 h-4 text-xs rounded transition-colors flex items-center justify-center font-mono
              ${hasData ? "hover:scale-125 cursor-pointer" : "cursor-not-allowed opacity-30"}
              ${
                isWeekSelected(year, weekNum)
                  ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                  : hasData
                    ? "bg-green-50 dark:bg-green-900/20 text-gray-900 dark:text-gray-100 hover:bg-green-100 dark:hover:bg-green-900/30"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
              }
            `}
          >
            {weekNum}
          </button>
        );
      });

      return { year, weekButtons };
    });
  };

  const weekGrid = createWeekGrid();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Select Week by Year</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click on any week number to view that week's charts. Hover for date range.
        </p>
      </div>

      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <div className="space-y-3">
          {weekGrid.map(({ year, weekButtons }) => (
            <div key={year} className="space-y-1 flex gap-6">
              <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{year}</div>
              <div className="flex gap-1 flex-wrap">{weekButtons}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 dark:bg-green-900/20 rounded border"></div>
            <span>Available week</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Selected week</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded border"></div>
            <span>No data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekMatrix;
