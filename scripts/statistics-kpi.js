// statistics-kpi.js - Xử lý KPI cards

import { formatCurrency, formatNumber, formatPercent } from './statistics-utils.js';

// Cập nhật các KPI cards
export function updateKPICards(data) {
  const { transactions, expenses } = data;
  
  // Tính toán các KPI hiện tại
  const currentKPIs = calculateKPIs(transactions, expenses);
  
  // Tính toán KPI kỳ trước để so sánh
  const previousKPIs = calculatePreviousPeriodKPIs(transactions, expenses);
  
  // Cập nhật UI
  updateKPICard('totalRevenue', currentKPIs.revenue, previousKPIs.revenue, 'revenue');
  updateKPICard('totalExpense', currentKPIs.expense, previousKPIs.expense, 'expense');
  updateKPICard('totalProfit', currentKPIs.profit, previousKPIs.profit, 'profit');
  updateKPICard('totalTransactions', currentKPIs.transactionCount, previousKPIs.transactionCount, 'count');
}

// Tính toán KPI cho kỳ hiện tại
function calculateKPIs(transactions, expenses) {
  let revenue = 0;
  let expense = 0;
  let transactionCount = 0;
  
  // Tính doanh thu từ giao dịch
  transactions.forEach(t => {
    if (t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử') {
      revenue += parseFloat(t.revenue) || 0;
      transactionCount++;
    } else if (t.transactionType === 'Hoàn Tiền') {
      revenue -= parseFloat(t.revenue) || 0;
      transactionCount++;
    }
  });
  
  // Tính chi phí (chỉ VND)
  expenses.forEach(e => {
    if (e.currency === 'VND') {
      expense += parseFloat(e.amount) || 0;
    }
  });
  
  return {
    revenue,
    expense,
    profit: revenue - expense,
    transactionCount
  };
}

// Tính toán KPI kỳ trước để so sánh
function calculatePreviousPeriodKPIs(transactions, expenses) {
  const { fromDate, toDate, timeFilter } = window.statisticsData;
  
  if (!fromDate || !toDate) {
    return { revenue: 0, expense: 0, profit: 0, transactionCount: 0 };
  }
  
  // Tính toán khoảng thời gian trước đó
  const periodDays = Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24));
  const prevToDate = new Date(fromDate);
  prevToDate.setDate(prevToDate.getDate() - 1);
  const prevFromDate = new Date(prevToDate);
  prevFromDate.setDate(prevFromDate.getDate() - periodDays + 1);
  
  const prevFromStr = formatDateString(prevFromDate);
  const prevToStr = formatDateString(prevToDate);
  
  // Lọc dữ liệu kỳ trước
  const prevTransactions = window.statisticsData.transactions.filter(t => {
    return isDateInRange(t.transactionDate, prevFromStr, prevToStr);
  });
  
  const prevExpenses = window.statisticsData.expenses.filter(e => {
    const expenseDate = normalizeDate(e.date);
    return isDateInRange(expenseDate, prevFromStr, prevToStr);
  });
  
  return calculateKPIs(prevTransactions, prevExpenses);
}

// Cập nhật một KPI card
function updateKPICard(elementId, currentValue, previousValue, type) {
  const valueElement = document.getElementById(elementId);
  const changeElement = document.getElementById(elementId.replace('total', '') + 'Change');
  
  if (!valueElement || !changeElement) return;
  
  // Cập nhật giá trị
  if (type === 'count') {
    valueElement.textContent = formatNumber(currentValue);
  } else {
    valueElement.textContent = formatCurrency(currentValue);
  }
  
  // Tính toán và hiển thị % thay đổi
  let changePercent = 0;
  let changeClass = 'neutral';
  
  if (previousValue !== 0) {
    changePercent = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
    
    if (changePercent > 0) {
      changeClass = type === 'expense' ? 'negative' : 'positive';
    } else if (changePercent < 0) {
      changeClass = type === 'expense' ? 'positive' : 'negative';
    }
  } else if (currentValue > 0) {
    changePercent = 100;
    changeClass = type === 'expense' ? 'negative' : 'positive';
  }
  
  // Cập nhật UI
  changeElement.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%`;
  changeElement.className = `kpi-change ${changeClass}`;
}

// Utility functions
function formatDateString(date) {
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
  return formatDateString(date);
}

function isDateInRange(dateStr, fromDate, toDate) {
  if (!dateStr || !fromDate || !toDate) return true;
  
  const date = dateStr.replace(/\//g, '');
  const from = fromDate.replace(/\//g, '');
  const to = toDate.replace(/\//g, '');
  
  return date >= from && date <= to;
}