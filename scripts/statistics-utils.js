// statistics-utils.js - Các hàm tiện ích cho thống kê

// Format tiền tệ
export function formatCurrency(amount, currency = 'VNĐ') {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' ' + currency;
}

// Format số
export function formatNumber(num) {
  if (typeof num !== 'number') {
    num = parseFloat(num) || 0;
  }
  
  return new Intl.NumberFormat('vi-VN').format(num);
}

// Format phần trăm
export function formatPercent(num, decimals = 1) {
  if (typeof num !== 'number') {
    num = parseFloat(num) || 0;
  }
  
  return num.toFixed(decimals) + '%';
}

// Tạo màu ngẫu nhiên cho biểu đồ
export function generateColors(count) {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
    '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  
  return result;
}

// Tạo màu gradient
export function generateGradients(count) {
  const gradients = [
    ['#FF6384', '#FF9F40'],
    ['#36A2EB', '#4BC0C0'],
    ['#FFCE56', '#FF6384'],
    ['#9966FF', '#36A2EB'],
    ['#FF9F40', '#FFCE56'],
    ['#4BC0C0', '#9966FF']
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(gradients[i % gradients.length]);
  }
  
  return result;
}

// Normalize date từ nhiều format
export function normalizeDate(dateInput) {
  if (!dateInput) return "";
  
  let date;
  if (typeof dateInput === 'string') {
    if (dateInput.includes('T')) {
      date = new Date(dateInput);
    } else if (dateInput.includes('/')) {
      const [y, m, d] = dateInput.split('/');
      date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = new Date(dateInput);
  }
  
  if (isNaN(date.getTime())) return "";
  
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}

// Kiểm tra ngày có trong khoảng không
export function isDateInRange(dateStr, fromDate, toDate) {
  if (!dateStr || !fromDate || !toDate) return true;
  
  const date = dateStr.replace(/\//g, '');
  const from = fromDate.replace(/\//g, '');
  const to = toDate.replace(/\//g, '');
  
  return date >= from && date <= to;
}

// Lấy tên tháng
export function getMonthName(monthIndex) {
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  
  return months[monthIndex] || '';
}

// Group data theo tháng
export function groupByMonth(data, dateField) {
  const grouped = {};
  
  data.forEach(item => {
    const date = normalizeDate(item[dateField]);
    if (!date) return;
    
    const monthKey = date.substring(0, 7); // YYYY/MM
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(item);
  });
  
  return grouped;
}

// Group data theo tuần
export function groupByWeek(data, dateField) {
  const grouped = {};
  
  data.forEach(item => {
    const date = normalizeDate(item[dateField]);
    if (!date) return;
    
    const dateObj = new Date(date);
    const weekStart = new Date(dateObj);
    weekStart.setDate(dateObj.getDate() - dateObj.getDay());
    
    const weekKey = normalizeDate(weekStart);
    if (!grouped[weekKey]) {
      grouped[weekKey] = [];
    }
    grouped[weekKey].push(item);
  });
  
  return grouped;
}

// Tính tổng doanh thu từ transactions
export function calculateRevenue(transactions) {
  let total = 0;
  
  transactions.forEach(t => {
    const revenue = parseFloat(t.revenue) || 0;
    
    if (t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử') {
      total += revenue;
    } else if (t.transactionType === 'Hoàn Tiền') {
      total -= revenue;
    }
  });
  
  return total;
}

// Tính tổng chi phí (chỉ VND)
export function calculateExpense(expenses) {
  return expenses.reduce((total, e) => {
    if (e.currency === 'VND') {
      return total + (parseFloat(e.amount) || 0);
    }
    return total;
  }, 0);
}

// Tạo dữ liệu cho time series chart
export function createTimeSeriesData(data, dateField, valueField, groupBy = 'month') {
  let grouped;
  
  if (groupBy === 'week') {
    grouped = groupByWeek(data, dateField);
  } else {
    grouped = groupByMonth(data, dateField);
  }
  
  const labels = Object.keys(grouped).sort();
  const values = labels.map(key => {
    return grouped[key].reduce((sum, item) => {
      return sum + (parseFloat(item[valueField]) || 0);
    }, 0);
  });
  
  return { labels, values };
}

// Sắp xếp object theo value giảm dần
export function sortObjectByValue(obj, limit = null) {
  const sorted = Object.entries(obj)
    .sort(([,a], [,b]) => b - a);
  
  if (limit) {
    return sorted.slice(0, limit);
  }
  
  return sorted;
}

// Debounce function cho search/filter
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Tạo ID duy nhất
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Deep clone object
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const copy = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone(obj[key]);
    });
    return copy;
  }
}

// Validate date format YYYY/MM/DD
export function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  
  const regex = /^\d{4}\/\d{2}\/\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const [year, month, day] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
}

// Tính số ngày giữa 2 ngày
export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

// Convert số thành text cho báo cáo
export function numberToText(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + ' tỷ';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + ' triệu';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + ' nghìn';
  }
  return num.toString();
}