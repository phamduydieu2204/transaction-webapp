// ==== scripts/statistics-kpi.js ====
import { formatCurrency, formatNumber, formatPercent, normalizeDate, calculateRevenue, calculateExpense } from './statistics-utils.js';

// Cập nhật các KPI cards
export function updateKPICards(data) {
  console.log("📊 [KPI] Updating KPI cards with data:", data);
  
  const { transactions, expenses } = data;
  
  // Tính toán các KPI hiện tại
  const currentKPIs = calculateKPIs(transactions, expenses);
  console.log("📊 [KPI] Calculated KPIs:", currentKPIs);
  
  // Tính toán KPI kỳ trước để so sánh (tạm thời = 0)
  const previousKPIs = { revenue: 0, expense: 0, profit: 0, transactionCount: 0 };
  
  // Cập nhật UI
  updateKPICard('totalRevenue', currentKPIs.revenue, previousKPIs.revenue, 'revenue');
  updateKPICard('totalExpense', currentKPIs.expense, previousKPIs.expense, 'expense');
  updateKPICard('totalProfit', currentKPIs.profit, previousKPIs.profit, 'profit');
  updateKPICard('totalTransactions', currentKPIs.transactionCount, previousKPIs.transactionCount, 'count');
}

// Tính toán KPI cho kỳ hiện tại
function calculateKPIs(transactions, expenses) {
  console.log("📊 [KPI] Calculating KPIs for:", {
    transactions: transactions.length,
    expenses: expenses.length
  });
  
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
  
  const result = {
    revenue,
    expense,
    profit: revenue - expense,
    transactionCount
  };
  
  console.log("📊 [KPI] KPI calculation result:", result);
  return result;
}

// Cập nhật một KPI card
function updateKPICard(elementId, currentValue, previousValue, type) {
  console.log(`📊 [KPI] Updating card ${elementId}:`, { currentValue, previousValue, type });
  
  const valueElement = document.getElementById(elementId);
  const changeElement = document.getElementById(elementId.replace('total', '') + 'Change');
  
  if (!valueElement) {
    console.error(`❌ [KPI] Element not found: ${elementId}`);
    return;
  }
  
  if (!changeElement) {
    console.warn(`⚠️ [KPI] Change element not found: ${elementId.replace('total', '') + 'Change'}`);
  }
  
  // Cập nhật giá trị
  if (type === 'count') {
    valueElement.textContent = formatNumber(currentValue);
  } else {
    valueElement.textContent = formatCurrency(currentValue);
  }
  
  console.log(`✅ [KPI] Updated ${elementId} to: ${valueElement.textContent}`);
  
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
  
  // Cập nhật UI change element nếu tồn tại
  if (changeElement) {
    changeElement.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%`;
    changeElement.className = `kpi-change ${changeClass}`;
  }
}