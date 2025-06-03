/**
 * statisticsRenderer.js
 * 
 * Main orchestrator for statistics rendering
 * Coordinates between different rendering modules
 */

// Import rendering modules
import { renderMonthlySummaryTable } from './statistics-renderer/tableRenderer.js';
import { renderFinancialOverview, renderExportControls } from './statistics-renderer/summaryRenderer.js';
import { renderSimpleChart } from './statistics-renderer/chartRenderer.js';
import { 
  renderLoadingState, 
  renderErrorState,
  isStatisticsTabActive,
  getContainer
} from './statistics-renderer/renderHelpers.js';

/**
 * Main statistics renderer class
 * Provides a unified interface for all statistics rendering operations
 */
class StatisticsRenderer {
  constructor() {
    this.renderers = {
      table: { renderMonthlySummaryTable },
      summary: { renderFinancialOverview, renderExportControls },
      chart: { renderSimpleChart },
      helpers: { renderLoadingState, renderErrorState }
    };
  }

  /**
   * Renders monthly summary table
   * @param {Array} summaryData - Monthly summary data
   * @param {Object} options - Rendering options
   */
  renderMonthlySummary(summaryData, options = {}) {
    if (!isStatisticsTabActive()) {
      console.log("⏭️ Statistics tab not active, queueing render");
      window.pendingStatsData = summaryData;
      window.pendingStatsOptions = options;
      return;
    }

    renderMonthlySummaryTable(summaryData, options);
  }

  /**
   * Renders financial overview
   * @param {Object} financialData - Financial data
   * @param {Object} options - Rendering options
   */
  renderFinancialOverview(financialData, options = {}) {
    const container = getContainer(options.containerId || "financialOverview");
    if (!container) return;

    renderFinancialOverview(financialData, options);
  }

  /**
   * Renders a chart
   * @param {Array} data - Chart data
   * @param {Object} options - Chart options
   */
  renderChart(data, options = {}) {
    const container = getContainer(options.containerId || "chartContainer");
    if (!container) return;

    renderSimpleChart(data, options);
  }

  /**
   * Renders export controls
   * @param {Object} options - Export options
   */
  renderExportControls(options = {}) {
    renderExportControls(options);
  }

  /**
   * Shows loading state
   * @param {string} containerId - Container ID
   * @param {string} message - Loading message
   */
  showLoading(containerId, message) {
    renderLoadingState(containerId, message);
  }

  /**
   * Shows error state
   * @param {string} containerId - Container ID
   * @param {string} error - Error message
   */
  showError(containerId, error) {
    renderErrorState(containerId, error);
  }

  /**
   * Renders pending statistics if any
   */
  renderPendingStatistics() {
    if (window.pendingStatsData && isStatisticsTabActive()) {
      console.log("📊 Rendering pending statistics");
      this.renderMonthlySummary(
        window.pendingStatsData, 
        window.pendingStatsOptions || {}
      );
      
      // Clear pending data
      window.pendingStatsData = null;
      window.pendingStatsOptions = null;
    }
  }
}

// Create singleton instance
const statisticsRenderer = new StatisticsRenderer();

// Export individual functions for backward compatibility
export { 
  renderMonthlySummaryTable,
  renderFinancialOverview,
  renderSimpleChart,
  renderExportControls,
  renderLoadingState,
  renderErrorState
};

// Export the main renderer instance
export default statisticsRenderer;