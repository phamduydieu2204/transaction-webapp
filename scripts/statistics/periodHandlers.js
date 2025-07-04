/**
 * periodHandlers.js
 * 
 * Date range and period handling utilities for statistics
 * Handles date range generation, period comparisons, and time-based filtering
 */

import { normalizeDate } from './dataUtilities.js';

/**
 * Generates date ranges for common periods
 * @param {string} period - Period type ("today", "week", "month", "quarter", "year")
 * @param {Date} referenceDate - Reference date (defaults to today)
 * @returns {Object} - Start and end dates for the period
 */
export function getDateRange(period, referenceDate = new Date()) {
  const today = new Date(referenceDate);
  const ranges = {};

  switch (period) {
    case "today":
      ranges.start = normalizeDate(today);
      ranges.end = normalizeDate(today);
      break;

    case "week":
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      ranges.start = normalizeDate(startOfWeek);
      ranges.end = normalizeDate(endOfWeek);
      break;

    case "month":
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      ranges.start = normalizeDate(startOfMonth);
      ranges.end = normalizeDate(endOfMonth);
      break;

    case "quarter":
      const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
      const startOfQuarter = new Date(today.getFullYear(), quarterStartMonth, 1);
      const endOfQuarter = new Date(today.getFullYear(), quarterStartMonth + 3, 0);
      
      ranges.start = normalizeDate(startOfQuarter);
      ranges.end = normalizeDate(endOfQuarter);
      break;

    case "year":
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      
      ranges.start = normalizeDate(startOfYear);
      ranges.end = normalizeDate(endOfYear);
      break;

    default:
      ranges.start = normalizeDate(today);
      ranges.end = normalizeDate(today);
  }

  // console.log(`📅 Generated ${period} range:`, ranges);
  return ranges;
}

/**
 * Generates custom date range
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {Object} - Normalized date range
 */
export function getCustomDateRange(startDate, endDate) {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  
  if (!start || !end) {
    console.warn("Invalid date range provided");
    return getDateRange("month"); // Fallback to current month
  }
  
  if (start > end) {
    console.warn("Start date is after end date, swapping");
    return { start: end, end: start };
  }
  
  return { start, end };
}

/**
 * Gets previous period date range for comparison
 * @param {string} period - Period type
 * @param {Date} referenceDate - Reference date
 * @returns {Object} - Previous period date range
 */
export function getPreviousPeriodRange(period, referenceDate = new Date()) {
  const today = new Date(referenceDate);
  
  switch (period) {
    case "today":
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return {
        start: normalizeDate(yesterday),
        end: normalizeDate(yesterday)
      };

    case "week":
      const prevWeekStart = new Date(today);
      prevWeekStart.setDate(today.getDate() - today.getDay() - 7);
      const prevWeekEnd = new Date(prevWeekStart);
      prevWeekEnd.setDate(prevWeekStart.getDate() + 6);
      
      return {
        start: normalizeDate(prevWeekStart),
        end: normalizeDate(prevWeekEnd)
      };

    case "month":
      const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      
      return {
        start: normalizeDate(prevMonth),
        end: normalizeDate(prevMonthEnd)
      };

    case "quarter":
      const currentQuarter = Math.floor(today.getMonth() / 3);
      const prevQuarterStart = currentQuarter === 0 
        ? new Date(today.getFullYear() - 1, 9, 1) // Q4 of previous year
        : new Date(today.getFullYear(), (currentQuarter - 1) * 3, 1);
      const prevQuarterEnd = currentQuarter === 0
        ? new Date(today.getFullYear() - 1, 11, 31)
        : new Date(today.getFullYear(), currentQuarter * 3, 0);
      
      return {
        start: normalizeDate(prevQuarterStart),
        end: normalizeDate(prevQuarterEnd)
      };

    case "year":
      const prevYear = new Date(today.getFullYear() - 1, 0, 1);
      const prevYearEnd = new Date(today.getFullYear() - 1, 11, 31);
      
      return {
        start: normalizeDate(prevYear),
        end: normalizeDate(prevYearEnd)
      };

    default:
      return getPreviousPeriodRange("month", referenceDate);
  }
}

/**
 * Gets same period from previous year for year-over-year comparison
 * @param {string} period - Period type
 * @param {Date} referenceDate - Reference date
 * @returns {Object} - Same period from previous year
 */
export function getSamePeriodLastYear(period, referenceDate = new Date()) {
  const today = new Date(referenceDate);
  const lastYear = today.getFullYear() - 1;
  
  switch (period) {
    case "today":
      const sameDayLastYear = new Date(lastYear, today.getMonth(), today.getDate());
      return {
        start: normalizeDate(sameDayLastYear),
        end: normalizeDate(sameDayLastYear)
      };

    case "week":
      const weekStartLastYear = new Date(lastYear, today.getMonth(), today.getDate() - today.getDay());
      const weekEndLastYear = new Date(weekStartLastYear);
      weekEndLastYear.setDate(weekStartLastYear.getDate() + 6);
      
      return {
        start: normalizeDate(weekStartLastYear),
        end: normalizeDate(weekEndLastYear)
      };

    case "month":
      const monthStartLastYear = new Date(lastYear, today.getMonth(), 1);
      const monthEndLastYear = new Date(lastYear, today.getMonth() + 1, 0);
      
      return {
        start: normalizeDate(monthStartLastYear),
        end: normalizeDate(monthEndLastYear)
      };

    case "quarter":
      const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
      const quarterStartLastYear = new Date(lastYear, quarterStartMonth, 1);
      const quarterEndLastYear = new Date(lastYear, quarterStartMonth + 3, 0);
      
      return {
        start: normalizeDate(quarterStartLastYear),
        end: normalizeDate(quarterEndLastYear)
      };

    case "year":
      return {
        start: normalizeDate(new Date(lastYear, 0, 1)),
        end: normalizeDate(new Date(lastYear, 11, 31))
      };

    default:
      return getSamePeriodLastYear("month", referenceDate);
  }
}

/**
 * Calculates the number of days between two dates
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {number} - Number of days
 */
export function getDaysBetween(startDate, endDate) {
  const start = new Date(normalizeDate(startDate));
  const end = new Date(normalizeDate(endDate));
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.warn("Invalid dates provided for day calculation");
    return 0;
  }
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Checks if a date falls within a given period
 * @param {string|Date} date - Date to check
 * @param {Object} period - Period with start and end dates
 * @returns {boolean} - Whether date is in period
 */
export function isDateInPeriod(date, period) {
  if (!date || !period || !period.start || !period.end) return false;
  
  const normalizedDate = normalizeDate(date);
  
  return normalizedDate >= period.start && normalizedDate <= period.end;
}

/**
 * Generates an array of months within a date range
 * @param {string} startDate - Start date in yyyy/mm/dd format
 * @param {string} endDate - End date in yyyy/mm/dd format
 * @returns {Array} - Array of month strings in yyyy/mm format
 */
export function getMonthsInRange(startDate, endDate) {
  const months = [];
  const start = new Date(normalizeDate(startDate));
  const end = new Date(normalizeDate(endDate));
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.warn("Invalid date range for month generation");
    return months;
  }
  
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  
  while (current <= endMonth) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    months.push(`${year}/${month}`);
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

/**
 * Gets the fiscal year for a given date
 * @param {string|Date} date - Date to get fiscal year for
 * @param {number} fiscalYearStart - Fiscal year start month (1-12, default 1 = January)
 * @returns {number} - Fiscal year
 */
export function getFiscalYear(date, fiscalYearStart = 1) {
  const dateObj = new Date(normalizeDate(date));
  
  if (isNaN(dateObj.getTime())) {
    console.warn("Invalid date for fiscal year calculation");
    return new Date().getFullYear();
  }
  
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // 1-indexed
  
  // If we're before the fiscal year start month, we're in the previous fiscal year
  if (month < fiscalYearStart) {
    return year;
  } else {
    return year + 1;
  }
}

/**
 * Gets fiscal year date range
 * @param {number} fiscalYear - Fiscal year
 * @param {number} fiscalYearStart - Fiscal year start month (1-12, default 1 = January)
 * @returns {Object} - Fiscal year date range
 */
export function getFiscalYearRange(fiscalYear, fiscalYearStart = 1) {
  const startYear = fiscalYear - 1;
  const endYear = fiscalYear;
  
  const start = new Date(startYear, fiscalYearStart - 1, 1);
  const end = new Date(endYear, fiscalYearStart - 1, 0); // Last day of the month before fiscal year start
  
  return {
    start: normalizeDate(start),
    end: normalizeDate(end)
  };
}

/**
 * Formats period name for display
 * @param {string} period - Period type
 * @param {Date} referenceDate - Reference date
 * @returns {string} - Formatted period name
 */
export function formatPeriodName(period, referenceDate = new Date()) {
  const date = new Date(referenceDate);
  
  switch (period) {
    case "today":
      return "Hôm nay";
    case "week":
      return "Tuần này";
    case "month":
      return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
    case "quarter":
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Quý ${quarter}/${date.getFullYear()}`;
    case "year":
      return `Năm ${date.getFullYear()}`;
    default:
      return period;
  }
}

// Make functions available globally for backward compatibility
window.getDateRange = getDateRange;
window.getCustomDateRange = getCustomDateRange;
window.getPreviousPeriodRange = getPreviousPeriodRange;
window.getSamePeriodLastYear = getSamePeriodLastYear;
window.getDaysBetween = getDaysBetween;
window.isDateInPeriod = isDateInPeriod;
window.getMonthsInRange = getMonthsInRange;
window.getFiscalYear = getFiscalYear;
window.getFiscalYearRange = getFiscalYearRange;
window.formatPeriodName = formatPeriodName;