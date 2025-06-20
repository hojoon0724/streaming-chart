import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const WeeklyCalendar = ({ availableDates, selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Helper function to format date to string
  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  // Parse available dates and convert to Date objects
  const parsedDates = useMemo(() => {
    if (!availableDates) return [];
    return availableDates
      .map((dateStr) => {
        const [year, month, day] = dateStr.split("/");
        return {
          dateStr,
          date: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
        };
      })
      .sort((a, b) => a.date - b.date);
  }, [availableDates]);

  // Get the range of available months
  const { minDate, maxDate } = useMemo(() => {
    if (parsedDates.length === 0) return { minDate: null, maxDate: null };
    return {
      minDate: parsedDates[0].date,
      maxDate: parsedDates[parsedDates.length - 1].date,
    };
  }, [parsedDates]);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    // Generate 42 days (6 weeks) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      const dayStr = formatDateToString(currentDate);
      const hasData = parsedDates.some((d) => d.dateStr === dayStr);
      const isCurrentMonth = currentDate.getMonth() === month;
      const isSelected = selectedDate === dayStr;

      days.push({
        date: new Date(currentDate),
        dateStr: dayStr,
        day: currentDate.getDate(),
        hasData,
        isCurrentMonth,
        isSelected,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [currentMonth, parsedDates, selectedDate, formatDateToString]);

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    if (!minDate || newMonth >= new Date(minDate.getFullYear(), minDate.getMonth(), 1)) {
      setCurrentMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    if (!maxDate || newMonth <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) {
      setCurrentMonth(newMonth);
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const canGoPrevious = !minDate || currentMonth > new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const canGoNext = !maxDate || currentMonth < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
          Select Week
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePreviousMonth}
            disabled={!canGoPrevious}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100 min-w-[140px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <button
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => day.hasData && onDateSelect(day.dateStr)}
            disabled={!day.hasData}
            className={`
              aspect-square p-2 text-sm rounded-md transition-colors relative
              ${day.isCurrentMonth ? "" : "opacity-30"}
              ${
                day.hasData
                  ? "hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }
              ${
                day.isSelected
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : day.hasData
                    ? "bg-green-50 dark:bg-green-900/20 text-gray-900 dark:text-gray-100"
                    : "text-gray-400 dark:text-gray-600"
              }
            `}
          >
            {day.day}
            {day.hasData && (
              <div
                className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                  day.isSelected ? "bg-white" : "bg-green-600 dark:bg-green-400"
                }`}
              />
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 dark:bg-green-900/20 rounded border"></div>
            <span>Available data</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;
