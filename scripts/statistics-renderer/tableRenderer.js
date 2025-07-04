/**
 * tableRenderer.js
 * 
 * Handles rendering of statistics tables and data grids
 * Manages table creation, updates, and data formatting
 */

import { formatCurrency, calculateGrowthRate } from '../statisticsCore.js';

/**
 * Renders the monthly expense summary table
 * @param {Array} summaryData - Monthly summary data
 * @param {Object} options - Rendering options
 */
export function renderMonthlySummaryTable(summaryData, options = {}) {
  const {
    tableId = "monthlySummaryTable",
    showGrowthRate = false,
    maxRows = 100
  } = options;

  // Check if statistics tab is currently active
  const currentTab = document.querySelector(".tab-button.active");
  const isThongKeTab = currentTab && currentTab.dataset.tab === "tab-thong-ke";
  
  if (!isThongKeTab) {
    // console.log(`⏭️ Statistics tab not active, skipping table render`);
    return;
  }

  // Get table element and ensure tbody exists
  const tableElement = document.getElementById(tableId);
  let tableBody = document.querySelector(`#${tableId} tbody`);

  // Create tbody if it doesn't exist (fix for missing tbody issue)
  if (!tableBody && tableElement) {
    // console.log(`🔧 Creating missing tbody for table ${tableId}`);
    tableBody = document.createElement('tbody');
    tableElement.appendChild(tableBody);
  }

  if (!tableBody) {
    console.error(`❌ Cannot find or create tbody for table ${tableId}`);
    window.pendingStatsData = summaryData;
    window.pendingStatsOptions = options;
    return;
  }

  // console.log("📊 Rendering monthly summary table:", summaryData.length, "entries");

  // Clear existing content
  tableBody.innerHTML = "";

  // Limit data if specified
  const dataToRender = summaryData.slice(0, maxRows);

  if (dataToRender.length === 0) {
    renderEmptyTableRow(tableBody);
    return;
  }

  dataToRender.forEach((item, index) => {
    renderTableRow(tableBody, item, index, dataToRender, showGrowthRate);
  });

  hideLoadingElements();
  // console.log("✅ Monthly summary table rendered successfully");
}

/**
 * Renders a single table row
 * @param {HTMLElement} tableBody - Table body element
 * @param {Object} item - Data item
 * @param {number} index - Row index
 * @param {Array} dataToRender - All data being rendered
 * @param {boolean} showGrowthRate - Whether to show growth rate
 */
function renderTableRow(tableBody, item, index, dataToRender, showGrowthRate) {
  const row = tableBody.insertRow();
  
  // Month column
  const monthCell = row.insertCell();
  monthCell.textContent = item.month;
  
  // Type column  
  const typeCell = row.insertCell();
  typeCell.textContent = item.type;
  
  // Amount column
  const amountCell = row.insertCell();
  amountCell.textContent = formatCurrency(item.amount, "VND");
  amountCell.style.textAlign = "right";
  amountCell.style.fontWeight = "bold";
  
  // Add growth rate if enabled and previous data exists
  if (showGrowthRate && index > 0) {
    addGrowthRateIndicator(amountCell, item, dataToRender[index - 1]);
  }
  
  // Add alternating row colors
  if (index % 2 === 1) {
    row.style.backgroundColor = "#f8f9fa";
  }
  
  // Highlight high amounts
  if (item.amount > 10000000) { // > 10M VND
    amountCell.style.color = "#dc3545";
    amountCell.style.fontWeight = "bold";
  }
}

/**
 * Adds growth rate indicator to amount cell
 * @param {HTMLElement} amountCell - Amount cell element
 * @param {Object} currentItem - Current data item
 * @param {Object} previousItem - Previous data item
 */
function addGrowthRateIndicator(amountCell, currentItem, previousItem) {
  if (previousItem.type !== currentItem.type) return;
  
  const growth = calculateGrowthRate(currentItem.amount, previousItem.amount);
  const growthSpan = document.createElement('span');
  growthSpan.style.fontSize = "0.8em";
  growthSpan.style.marginLeft = "8px";
  
  if (growth.direction === "up") {
    growthSpan.style.color = "#28a745";
    growthSpan.textContent = `↑${growth.rate.toFixed(1)}%`;
  } else if (growth.direction === "down") {
    growthSpan.style.color = "#dc3545";
    growthSpan.textContent = `↓${growth.rate.toFixed(1)}%`;
  } else {
    growthSpan.style.color = "#6c757d";
    growthSpan.textContent = "→0%";
  }
  
  amountCell.appendChild(growthSpan);
}

/**
 * Renders empty table row when no data
 * @param {HTMLElement} tableBody - Table body element
 */
function renderEmptyTableRow(tableBody) {
  const row = tableBody.insertRow();
  row.innerHTML = `
    <td colspan="3" style="text-align: center; color: #666; font-style: italic;">
      Không có dữ liệu thống kê
    </td>
  `;
}

/**
 * Hides any visible loading elements
 */
function hideLoadingElements() {
  const loadingElements = [
    document.querySelector('.loading-state'),
    document.querySelector('.loading-spinner'),
    document.querySelector('#loading'),
    document.querySelector('[class*="loading"]'),
    document.querySelector('[class*="spinner"]')
  ].filter(el => el !== null);

  console.log("🔍 DEBUG loading elements after render:", {
    foundLoadingElements: loadingElements.length,
    loadingElements: loadingElements.map(el => ({
      tagName: el.tagName,
      className: el.className,
      id: el.id,
      display: window.getComputedStyle(el).display,
      visibility: window.getComputedStyle(el).visibility
    }))
  });

  // Hide any visible loading elements
  loadingElements.forEach(el => {
    if (window.getComputedStyle(el).display !== 'none') {
      // console.log(`🚫 Hiding loading element:`, el.className || el.id);
      el.style.display = 'none';
    }
  });
}