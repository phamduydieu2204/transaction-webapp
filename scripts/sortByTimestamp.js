// Utility function để sắp xếp theo timestamp ID (mới nhất lên đầu)
export function sortByTimestampDesc(items, idField = 'id') {
  return [...items].sort((a, b) => {
    const timestampA = (a[idField] || "").replace(/[^0-9]/g, "");
    const timestampB = (b[idField] || "").replace(/[^0-9]/g, "");
    return timestampB.localeCompare(timestampA);
  });
}

// Utility function để sắp xếp theo timestamp ID (cũ nhất lên đầu)
export function sortByTimestampAsc(items, idField = 'id') {
  return [...items].sort((a, b) => {
    const timestampA = (a[idField] || "").replace(/[^0-9]/g, "");
    const timestampB = (b[idField] || "").replace(/[^0-9]/g, "");
    return timestampA.localeCompare(timestampB);
  });
}

// Utility function để trích xuất thời gian từ timestamp ID
export function parseTimestampFromId(id) {
  const timestamp = (id || "").replace(/[^0-9]/g, "");
  if (timestamp.length !== 12) return null;
  
  const year = timestamp.substring(0, 4);
  const month = timestamp.substring(4, 6);
  const day = timestamp.substring(6, 8);
  const hour = timestamp.substring(8, 10);
  const minute = timestamp.substring(10, 12);
  
  return {
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day),
    hour: parseInt(hour),
    minute: parseInt(minute),
    formatted: `${day}/${month}/${year} ${hour}:${minute}`,
    date: new Date(year, month - 1, day, hour, minute)
  };
}