/**
 * Utilities for date and time operations
 */

// Get the start of the day (midnight)
exports.getStartOfDay = (date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

// Get the end of the day (23:59:59.999)
exports.getEndOfDay = (date = new Date()) => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

// Get the start of the week (Sunday)
exports.getStartOfWeek = (date = new Date()) => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
  startOfWeek.setDate(startOfWeek.getDate() - day);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

// Get the end of the week (Saturday)
exports.getEndOfWeek = (date = new Date()) => {
  const endOfWeek = new Date(date);
  const day = endOfWeek.getDay();
  endOfWeek.setDate(endOfWeek.getDate() + (6 - day));
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
};

// Get the start of the month
exports.getStartOfMonth = (date = new Date()) => {
  const startOfMonth = new Date(date);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  return startOfMonth;
};

// Get the end of the month
exports.getEndOfMonth = (date = new Date()) => {
  const endOfMonth = new Date(date);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);
  return endOfMonth;
};

// Format date to YYYY-MM-DD
exports.formatDateYYYYMMDD = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format time to HH:MM
exports.formatTimeHHMM = (date = new Date()) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Format datetime to YYYY-MM-DD HH:MM
exports.formatDateTime = (date = new Date()) => {
  return `${this.formatDateYYYYMMDD(date)} ${this.formatTimeHHMM(date)}`;
};

// Get time difference in minutes
exports.getDifferenceInMinutes = (startDate, endDate) => {
  const diffMs = Math.abs(new Date(endDate) - new Date(startDate));
  return Math.floor(diffMs / (1000 * 60));
};

// Check if two time ranges overlap
exports.doTimeRangesOverlap = (startA, endA, startB, endB) => {
  // Convert to Date objects if they're not already
  const start1 = new Date(startA);
  const end1 = new Date(endA);
  const start2 = new Date(startB);
  const end2 = new Date(endB);
  
  // Check for overlap
  return (start1 < end2 && start2 < end1);
};