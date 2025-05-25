// ==== scripts/statistics-core.js ====
import { getConstants } from './constants.js';
import { updateKPICards } from './statistics-kpi.js';
import { renderCharts } from './statistics-charts.js';
import { updateStatsTables } from './statistics-tables.js';

// Biến global cho thống kê
window.statisticsData = {
  transactions: [],
  expenses: [],
  filteredData: {
    transactions: [],
    expenses: []
  },
  timeFilter: 'month',
  fromDate: null,
  toDate: null
};

// Khởi tạo tab thống kê
export async function initStatistics() {
  console.log("📊 Khởi tạo tab thống kê...");
  
  setupStatisticsEventListeners();
  await loadStatisticsData();
  setTimeFilter('month');
  filterAndRenderData();
}

function setupStatisticsEventListeners() {
  const timeFilterSelect = document.getElementById('statsTimeFilter');
  if (timeFilterSelect) {
    timeFilterSelect.addEventListener('change', handleTimeFilterChange);
  }
}

function handleTimeFilterChange(event) {
  const value = event.target.value;
  window.statisticsData.timeFilter = value;
  
  const customDateRange = document.getElementById('customDateRange');
  if (customDateRange) {
    customDateRange.style.display = value === 'custom' ? 'flex' : 'none';
  }
  
  if (value !== 'custom') {
    setTimeFilter(value);
    filterAndRenderData();
  }
}

window.applyCustomDateFilter = function() {
  const fromDate = document.getElementById('statsFromDate').value;
  const toDate = document.getElementById('statsToDate').value;
  
  if (fromDate && toDate) {
    window.statisticsData.fromDate = fromDate;
    window.statisticsData.toDate = toDate;
    filterAndRenderData();
  }
};

function setTimeFilter(period) {
  const today = new Date();
  let fromDate, toDate;
  
  switch (period) {
    case 'today':
      fromDate = toDate = formatDate(today);
      break;
    case 'week':
      fromDate = formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
      toDate = formatDate(today);
      break;
    case 'month':
      fromDate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
      toDate = formatDate(today);
      break;
    case 'quarter':
      const quarter = Math.floor(today.getMonth() / 3);
      fromDate = formatDate(new Date(today.getFullYear(), quarter * 3, 1));
      toDate = formatDate(today);
      break;
    case 'year':
      fromDate = formatDate(new Date(today.getFullYear(), 0, 1));
      toDate = formatDate(today);
      break;
  }
  
  window.statisticsData.fromDate = fromDate;
  window.statisticsData.toDate = toDate;
}

async function loadStatisticsData() {
  try {
    const { BACKEND_URL } = getConstants();
    
    // Load transactions
    const transactionsResponse = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getTransactions",
        maNhanVien: window.userInfo?.maNhanVien || "",
        vaiTro: "admin",
        giaoDichNhinThay: "bán hàng,hoàn tiền,dùng thử,nhập hàng",
        nhinThayGiaoDichCuaAi: "tất cả"
      })
    });
    
    const transactionsResult = await transactionsResponse.json();
    if (transactionsResult.status === "success") {
      window.statisticsData.transactions = transactionsResult.data || [];
    }
    
    // Load expenses
    const expensesResponse = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getExpenseStats"
      })
    });
    
    const expensesResult = await expensesResponse.json();
    if (expensesResult.status === "success") {
      window.statisticsData.expenses = expensesResult.data || [];
    }
    
  } catch (error) {
    console.error("❌ Lỗi khi tải dữ liệu thống kê:", error);
  }
}

function filterAndRenderData() {
  const { transactions, expenses, fromDate, toDate } = window.statisticsData;
  
  // Filter transactions
  window.statisticsData.filteredData.transactions = transactions.filter(t => {
    const transactionDate = t.transactionDate;
    return isDateInRange(transactionDate, fromDate, toDate);
  });
  
  // Filter expenses
  window.statisticsData.filteredData.expenses = expenses.filter(e => {
    const expenseDate = normalizeDate(e.date);
    return isDateInRange(expenseDate, fromDate, toDate);
  });
  
  renderStatistics();
}

function renderStatistics() {
  try {
    updateKPICards(window.statisticsData.filteredData);
    renderCharts(window.statisticsData.filteredData);
    updateStatsTables(window.statisticsData.filteredData);
  } catch (error) {
    console.error("❌ Lỗi khi render thống kê:", error);
  }
}

// Utility functions
function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}

function normalizeDate(dateInput) {
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
  
  return formatDate(date);
}

function isDateInRange(dateStr, fromDate, toDate) {
  if (!dateStr || !fromDate || !toDate) return true;
  
  const date = dateStr.replace(/\//g, '');
  const from = fromDate.replace(/\//g, '');
  const to = toDate.replace(/\//g, '');
  
  return date >= from && date <= to;
}