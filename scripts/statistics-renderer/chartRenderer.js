/**
 * chartRenderer.js
 * 
 * Handles rendering of various chart types for statistics visualization
 * Provides bar, line, and pie chart rendering capabilities
 */

import { formatCurrency } from '../statisticsCore.js';

/**
 * Creates a simple chart visualization
 * @param {Array} data - Chart data
 * @param {Object} options - Chart options
 */
export function renderSimpleChart(data, options = {}) {
  const {
    containerId = "chartContainer",
    chartType = "bar", // "bar", "line", "pie"
    title = "Chart",
    xLabel = "",
    yLabel = "",
    maxBars = 20
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Chart container #${containerId} not found`);
    return;
  }

  // console.log(`📈 Rendering ${chartType} chart:`, data.length, "data points");

  // Limit data for readability
  const chartData = data.slice(0, maxBars);

  if (chartData.length === 0) {
    container.innerHTML = `
      <div class="chart-placeholder">
        <p>Không có dữ liệu để hiển thị biểu đồ</p>
      </div>
    `;
    return;
  }

  switch (chartType) {
    case "bar":
      renderBarChart(container, chartData, { title, xLabel, yLabel });
      break;
    case "line":
      renderLineChart(container, chartData, { title, xLabel, yLabel });
      break;
    case "pie":
      renderPieChart(container, chartData, { title });
      break;
    default:
      console.error("❌ Unsupported chart type:", chartType);
  }
}

/**
 * Renders a simple bar chart using CSS
 * @param {HTMLElement} container - Container element
 * @param {Array} data - Chart data
 * @param {Object} options - Chart options
 */
function renderBarChart(container, data, options) {
  const { title, xLabel, yLabel } = options;
  
  // Find max value for scaling
  const maxValue = Math.max(...data.map(item => item.amount || item.value || 0));
  
  const chartHTML = `
    <div class="simple-chart bar-chart">
      <h4 class="chart-title">${title}</h4>
      <div class="chart-area">
        <div class="y-axis-label">${yLabel}</div>
        <div class="bars-container">
          ${data.map((item, index) => {
            const value = item.amount || item.value || 0;
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const label = item.month || item.type || item.label || `Item ${index + 1}`;
            
            return `
              <div class="bar-wrapper">
                <div class="bar" style="height: ${height}%;" title="${formatCurrency(value, 'VND')}">
                  <div class="bar-value">${formatCurrency(value, 'VND')}</div>
                </div>
                <div class="bar-label">${label}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="x-axis-label">${xLabel}</div>
      </div>
    </div>
  `;
  
  container.innerHTML = chartHTML;
  addChartStyles();
}

/**
 * Renders a line chart (placeholder for future implementation)
 * @param {HTMLElement} container - Container element
 * @param {Array} data - Chart data
 * @param {Object} options - Chart options
 */
function renderLineChart(container, data, options) {
  // TODO: Implement line chart rendering
  // console.log("📊 Line chart rendering not yet implemented");
  renderBarChart(container, data, options); // Fallback to bar chart
}

/**
 * Renders a pie chart (placeholder for future implementation)
 * @param {HTMLElement} container - Container element
 * @param {Array} data - Chart data
 * @param {Object} options - Chart options
 */
function renderPieChart(container, data, options) {
  // TODO: Implement pie chart rendering
  // console.log("📊 Pie chart rendering not yet implemented");
  renderBarChart(container, data, options); // Fallback to bar chart
}

/**
 * Adds CSS styles for charts
 */
function addChartStyles() {
  if (document.getElementById('chart-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'chart-styles';
  styles.textContent = `
    .simple-chart {
      margin: 20px 0;
      padding: 20px;
      border: 1px solid #dee2e6;
      border-radius: 5px;
    }
    .chart-title {
      text-align: center;
      margin-bottom: 20px;
      color: #333;
    }
    .bars-container {
      display: flex;
      align-items: flex-end;
      height: 200px;
      gap: 10px;
      padding: 20px 0;
      overflow-x: auto;
    }
    .bar-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
    }
    .bar {
      width: 40px;
      background: linear-gradient(to top, #007bff, #0056b3);
      border-radius: 3px 3px 0 0;
      position: relative;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .bar:hover {
      background: linear-gradient(to top, #0056b3, #004085);
    }
    .bar-value {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 2px 5px;
      border-radius: 3px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .bar:hover .bar-value {
      opacity: 1;
    }
    .bar-label {
      margin-top: 10px;
      font-size: 12px;
      text-align: center;
      transform: rotate(-45deg);
      width: 80px;
    }
    .chart-placeholder {
      text-align: center;
      padding: 40px;
      color: #6c757d;
      font-style: italic;
    }
  `;
  document.head.appendChild(styles);
}

export { renderBarChart, renderLineChart, renderPieChart };