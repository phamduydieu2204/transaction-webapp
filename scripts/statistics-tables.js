// statistics-tables.js - Xử lý bảng thống kê

import { 
  formatCurrency, 
  formatNumber, 
  groupByMonth,
  calculateRevenue,
  calculateExpense,
  sortObjectByValue
} from './statistics-utils.js';

// Cập nhật tất cả bảng thống kê
export function updateStatsTables(data) {
  console.log("📋 Updating statistics tables...");
  
  updateTopSoftwareTable(data);
  updateMonthlySummaryTable(data);
  updateEmployeeStatsTable(data);
  updateExpenseByCategoryTable(data);
}

// Bảng top phần mềm bán chạy
function updateTopSoftwareTable(data) {
  const { transactions } = data;
  const tbody = document.querySelector('#topSoftwareTable tbody');
  if (!tbody) return;
  
  const softwareStats = {};
  let totalRevenue = 0;
  
  transactions.forEach(t => {
    if (t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử') {
      const key = `${t.softwareName} - ${t.softwarePackage}`;
      const revenue = parseFloat(t.revenue) || 0;
      
      if (!softwareStats[key]) {
        softwareStats[key] = {
          name: key,
          count: 0,
          revenue: 0
        };
      }
      
      softwareStats[key].count++;
      softwareStats[key].revenue += revenue;
      totalRevenue += revenue;
    }
  });
  
  const sorted = Object.values(softwareStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  tbody.innerHTML = '';
  
  sorted.forEach((item, index) => {
    const percentage = totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) : 0;
    
    const row = tbody.insertRow();
    row.innerHTML = `
      <td class="rank">${index + 1}</td>
      <td>${item.name}</td>
      <td>${formatNumber(item.count)}</td>
      <td class="currency">${formatCurrency(item.revenue)}</td>
      <td class="percentage">${percentage}%</td>
    `;
  });
}

// Bảng tổng hợp theo tháng
function updateMonthlySummaryTable(data) {
  const { transactions, expenses } = data;
  const tbody = document.querySelector('#monthlySummaryTable tbody');
  if (!tbody) return;
  
  // Group data by month
  const revenueByMonth = groupByMonth(transactions, 'transactionDate');
  const expenseByMonth = groupByMonth(expenses, 'date');
  
  // Get all months
  const allMonths = new Set([
    ...Object.keys(revenueByMonth),
    ...Object.keys(expenseByMonth)
  ]);
  
  const monthlyData = Array.from(allMonths).map(month => {
    const monthTransactions = revenueByMonth[month] || [];
    const monthExpenses = expenseByMonth[month] || [];
    
    const revenue = calculateRevenue(monthTransactions);
    const expense = calculateExpense(monthExpenses);
    const profit = revenue - expense;
    const transactionCount = monthTransactions.filter(t => 
      t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử'
    ).length;
    const averagePerTransaction = transactionCount > 0 ? revenue / transactionCount : 0;
    
    return {
      month,
      revenue,
      expense,
      profit,
      transactionCount,
      averagePerTransaction
    };
  }).sort((a, b) => b.month.localeCompare(a.month));
  
  tbody.innerHTML = '';
  
  monthlyData.forEach(item => {
    const [year, month] = item.month.split('/');
    const monthName = `${month}/${year}`;
    
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${monthName}</td>
      <td class="currency">${formatCurrency(item.revenue)}</td>
      <td class="currency">${formatCurrency(item.expense)}</td>
      <td class="currency" style="color: ${item.profit >= 0 ? '#28a745' : '#dc3545'}">${formatCurrency(item.profit)}</td>
      <td>${formatNumber(item.transactionCount)}</td>
      <td class="currency">${formatCurrency(item.averagePerTransaction)}</td>
    `;
  });
}

// Bảng hiệu suất nhân viên
function updateEmployeeStatsTable(data) {
  const { transactions } = data;
  const tbody = document.querySelector('#employeeStatsTable tbody');
  if (!tbody) return;
  
  const employeeStats = {};
  let totalRevenue = 0;
  
  transactions.forEach(t => {
    if (t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử') {
      const key = t.tenNhanVien || 'Không xác định';
      const revenue = parseFloat(t.revenue) || 0;
      
      if (!employeeStats[key]) {
        employeeStats[key] = {
          name: key,
          count: 0,
          revenue: 0
        };
      }
      
      employeeStats[key].count++;
      employeeStats[key].revenue += revenue;
      totalRevenue += revenue;
    }
  });
  
  const sorted = Object.values(employeeStats)
    .sort((a, b) => b.revenue - a.revenue);
  
  tbody.innerHTML = '';
  
  sorted.forEach(item => {
    const percentage = totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) : 0;
    const averagePerTransaction = item.count > 0 ? item.revenue / item.count : 0;
    
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${formatNumber(item.count)}</td>
      <td class="currency">${formatCurrency(item.revenue)}</td>
      <td class="currency">${formatCurrency(averagePerTransaction)}</td>
      <td class="percentage">${percentage}%</td>
    `;
  });
}

// Bảng chi phí theo danh mục
function updateExpenseByCategoryTable(data) {
  const { expenses } = data;
  const tbody = document.querySelector('#expenseByCategoryTable tbody');
  if (!tbody) return;
  
  const categoryStats = {};
  let totalExpense = 0;
  
  expenses.forEach(e => {
    if (e.currency === 'VND') {
      const key = e.type || 'Khác';
      const amount = parseFloat(e.amount) || 0;
      
      if (!categoryStats[key]) {
        categoryStats[key] = {
          name: key,
          count: 0,
          amount: 0
        };
      }
      
      categoryStats[key].count++;
      categoryStats[key].amount += amount;
      totalExpense += amount;
    }
  });
  
  const sorted = Object.values(categoryStats)
    .sort((a, b) => b.amount - a.amount);
  
  tbody.innerHTML = '';
  
  sorted.forEach(item => {
    const percentage = totalExpense > 0 ? ((item.amount / totalExpense) * 100).toFixed(1) : 0;
    const averagePerItem = item.count > 0 ? item.amount / item.count : 0;
    
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${formatNumber(item.count)}</td>
      <td class="currency">${formatCurrency(item.amount)}</td>
      <td class="currency">${formatCurrency(averagePerItem)}</td>
      <td class="percentage">${percentage}%</td>
    `;
  });
}