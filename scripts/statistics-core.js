// ==== scripts/statistics-core-debug.js ====
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

// Khởi tạo tab thống kê với debug
export async function initStatistics() {
  console.log("🚀 [DEBUG] Bắt đầu khởi tạo tab thống kê...");
  
  // Kiểm tra HTML elements
  const tabElement = document.getElementById('tab-thong-ke');
  if (!tabElement) {
    console.error("❌ [DEBUG] Không tìm thấy element #tab-thong-ke");
    return;
  }
  console.log("✅ [DEBUG] Tìm thấy tab-thong-ke element");
  
  // Kiểm tra các elements con
  const kpiCards = document.querySelector('.kpi-cards');
  const timeFilter = document.getElementById('statsTimeFilter');
  
  console.log("🔍 [DEBUG] Kiểm tra elements:");
  console.log("- kpi-cards:", !!kpiCards);
  console.log("- timeFilter:", !!timeFilter);
  
  setupStatisticsEventListeners();
  await loadStatisticsData();
  setTimeFilter('month');
  filterAndRenderData();
}

function setupStatisticsEventListeners() {
  console.log("🔧 [DEBUG] Setup event listeners...");
  
  const timeFilterSelect = document.getElementById('statsTimeFilter');
  if (timeFilterSelect) {
    timeFilterSelect.addEventListener('change', handleTimeFilterChange);
    console.log("✅ [DEBUG] Event listener đã được gắn cho timeFilter");
  } else {
    console.warn("⚠️ [DEBUG] Không tìm thấy #statsTimeFilter");
  }
}

function handleTimeFilterChange(event) {
  console.log("📅 [DEBUG] Time filter changed:", event.target.value);
  
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
  console.log("📅 [DEBUG] Applying custom date filter...");
  
  const fromDate = document.getElementById('statsFromDate').value;
  const toDate = document.getElementById('statsToDate').value;
  
  console.log("📅 [DEBUG] Custom dates:", { fromDate, toDate });
  
  if (fromDate && toDate) {
    window.statisticsData.fromDate = fromDate;
    window.statisticsData.toDate = toDate;
    filterAndRenderData();
  }
};

function setTimeFilter(period) {
  console.log("📅 [DEBUG] Setting time filter:", period);
  
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
  
  console.log("📅 [DEBUG] Date range set:", { fromDate, toDate });
}

async function loadStatisticsData() {
  try {
    console.log("📊 [DEBUG] Bắt đầu tải dữ liệu thống kê...");
    
    const { BACKEND_URL } = getConstants();
    console.log("🔗 [DEBUG] Backend URL:", BACKEND_URL);
    
    // Kiểm tra userInfo
    console.log("👤 [DEBUG] User info:", window.userInfo);
    
    if (!window.userInfo) {
      console.error("❌ [DEBUG] Không có thông tin user");
      return;
    }
    
    // Load transactions
    console.log("📊 [DEBUG] Loading transactions...");
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
    console.log("📊 [DEBUG] Transactions response:", transactionsResult);
    
    if (transactionsResult.status === "success") {
      window.statisticsData.transactions = transactionsResult.data || [];
      console.log("✅ [DEBUG] Loaded transactions:", window.statisticsData.transactions.length);
    } else {
      console.error("❌ [DEBUG] Failed to load transactions:", transactionsResult.message);
    }
    
    // Load expenses
    console.log("💸 [DEBUG] Loading expenses...");
    const expensesResponse = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getExpenseStats"
      })
    });
    
    const expensesResult = await expensesResponse.json();
    console.log("💸 [DEBUG] Expenses response:", expensesResult);
    
    if (expensesResult.status === "success") {
      window.statisticsData.expenses = expensesResult.data || [];
      console.log("✅ [DEBUG] Loaded expenses:", window.statisticsData.expenses.length);
    } else {
      console.error("❌ [DEBUG] Failed to load expenses:", expensesResult.message);
    }
    
    console.log("✅ [DEBUG] Hoàn tất tải dữ liệu thống kê");
    
  } catch (error) {
    console.error("❌ [DEBUG] Lỗi khi tải dữ liệu thống kê:", error);
  }
}

function filterAndRenderData() {
  console.log("🔄 [DEBUG] Filtering and rendering data...");
  
  const { transactions, expenses, fromDate, toDate } = window.statisticsData;
  
  console.log("📊 [DEBUG] Raw data:", {
    transactions: transactions.length,
    expenses: expenses.length,
    fromDate,
    toDate
  });
  
  // Filter transactions
  window.statisticsData.filteredData.transactions = transactions.filter(t => {
    const transactionDate = t.transactionDate;
    const inRange = isDateInRange(transactionDate, fromDate, toDate);
    return inRange;
  });
  
  // Filter expenses
  window.statisticsData.filteredData.expenses = expenses.filter(e => {
    const expenseDate = normalizeDate(e.date);
    const inRange = isDateInRange(expenseDate, fromDate, toDate);
    return inRange;
  });
  
  console.log("📊 [DEBUG] Filtered data:", {
    transactions: window.statisticsData.filteredData.transactions.length,
    expenses: window.statisticsData.filteredData.expenses.length
  });
  
  renderStatistics();
}

function renderStatistics() {
  console.log("🎨 [DEBUG] Rendering statistics...");
  
  try {
    // Kiểm tra các elements trước khi render
    const elements = {
      totalRevenue: document.getElementById('totalRevenue'),
      totalExpense: document.getElementById('totalExpense'),
      totalProfit: document.getElementById('totalProfit'),
      totalTransactions: document.getElementById('totalTransactions')
    };
    
    console.log("🔍 [DEBUG] KPI Elements found:", {
      totalRevenue: !!elements.totalRevenue,
      totalExpense: !!elements.totalExpense,
      totalProfit: !!elements.totalProfit,
      totalTransactions: !!elements.totalTransactions
    });
    
    // Render từng phần với error handling
    try {
      console.log("📊 [DEBUG] Updating KPI cards...");
      updateKPICards(window.statisticsData.filteredData);
      console.log("✅ [DEBUG] KPI cards updated");
    } catch (error) {
      console.error("❌ [DEBUG] Error updating KPI cards:", error);
    }
    
    try {
      console.log("📈 [DEBUG] Rendering charts...");
      renderCharts(window.statisticsData.filteredData);
      console.log("✅ [DEBUG] Charts rendered");
    } catch (error) {
      console.error("❌ [DEBUG] Error rendering charts:", error);
    }
    
    try {
      console.log("📋 [DEBUG] Updating tables...");
      updateStatsTables(window.statisticsData.filteredData);
      console.log("✅ [DEBUG] Tables updated");
    } catch (error) {
      console.error("❌ [DEBUG] Error updating tables:", error);
    }
    
  } catch (error) {
    console.error("❌ [DEBUG] Lỗi khi render thống kê:", error);
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

// Export debug function
window.debugStatistics = function() {
  console.log("🔍 [DEBUG] Statistics Debug Info:");
  console.log("- statisticsData:", window.statisticsData);
  console.log("- tab element:", document.getElementById('tab-thong-ke'));
  console.log("- KPI elements:", {
    totalRevenue: document.getElementById('totalRevenue'),
    totalExpense: document.getElementById('totalExpense'),
    totalProfit: document.getElementById('totalProfit'),
    totalTransactions: document.getElementById('totalTransactions')
  });
};