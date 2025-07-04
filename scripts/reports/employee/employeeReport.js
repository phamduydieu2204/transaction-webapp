/**
 * Employee Report Main Module
 * Main entry point for employee report functionality
 */

import { EmployeeReportLoader } from './employeeReportLoader.js';
import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';

let employeeReportLoader = null;

/**
 * Load and initialize employee report
 */
export async function loadEmployeeReport() {
    try {
// console.log('🧑‍💼 Loading Employee Report...');
        
        // Ensure data is loaded first
        await ensureDataIsLoaded();
        
        // Cleanup previous instance if exists
        if (employeeReportLoader) {
            employeeReportLoader.cleanup();
        }

        // Create new instance
        employeeReportLoader = new EmployeeReportLoader();
        
        // Load the HTML template first
        await loadEmployeeReportTemplate();
        
        // Initialize the report
        await employeeReportLoader.init();
        
        // console.log('✅ Employee Report loaded successfully');
        
    } catch (error) {
        console.error('❌ Failed to load Employee Report:', error);
        showEmployeeReportError('Không thể tải báo cáo nhân viên');
    }
}

/**
 * Load employee report HTML template
 */
async function loadEmployeeReportTemplate() {
    const container = document.getElementById('report-employee');
    if (!container) {
        throw new Error('Employee report container not found');
    }

    try {
        // Load the HTML template
        const response = await fetch('./partials/tabs/report-pages/employee-report.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        container.innerHTML = html;
        
        // Initialize Chart.js canvases
        initializeChartCanvases();
        
        // console.log('📄 Employee report template loaded');
        
    } catch (error) {
        console.error('Failed to load employee report template:', error);
        throw error;
    }
}

/**
 * Initialize Chart.js canvases
 */
function initializeChartCanvases() {
    // Performance chart
    const performanceCanvas = document.getElementById('employeePerformanceChart');
    if (performanceCanvas) {
        performanceCanvas.width = 400;
        performanceCanvas.height = 300;
    }

    // Revenue chart  
    const revenueCanvas = document.getElementById('employeeRevenueChart');
    if (revenueCanvas) {
        revenueCanvas.width = 400;
        revenueCanvas.height = 300;
    }
}

/**
 * Show error message for employee report
 */
function showEmployeeReportError(message) {
    const container = document.getElementById('report-employee');
    if (container) {
        container.innerHTML = `
            <div class="employee-report-container">
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Lỗi!</h4>
                    <p>${message}</p>
                    <hr>
                    <p class="mb-0">
                        <button class="btn btn-outline-danger" onclick="window.loadReport('employee')">
                            Thử lại
                        </button>
                    </p>
                </div>
            </div>
        `;
    }
}

/**
 * Refresh employee report
 */
export async function refreshEmployeeReport() {
    if (employeeReportLoader) {
        await employeeReportLoader.refresh();
    } else {
        await loadEmployeeReport();
    }
}

/**
 * Export employee report data
 */
export function exportEmployeeReport() {
    if (employeeReportLoader) {
        employeeReportLoader.exportData();
    } else {
// console.warn('Employee report not initialized');
    }
}

/**
 * Cleanup employee report
 */
export function cleanupEmployeeReport() {
    if (employeeReportLoader) {
        employeeReportLoader.cleanup();
        employeeReportLoader = null;
    }
}

// Make functions available globally
window.loadEmployeeReport = loadEmployeeReport;
window.refreshEmployeeReport = refreshEmployeeReport;
window.exportEmployeeReport = exportEmployeeReport;
window.cleanupEmployeeReport = cleanupEmployeeReport;