// Chạy trong Console để debug
function debugChartElements() {
  console.log('🔍 Debugging chart elements...');
  
  // Check Chart.js
  console.log('Chart.js available:', typeof Chart !== 'undefined');
  if (typeof Chart !== 'undefined') {
    console.log('Chart.js version:', Chart.version);
  }
  
  // Check canvas elements
  const revenueCanvas = document.getElementById('revenueTrendChart');
  const productCanvas = document.getElementById('productPerfChart');
  
  console.log('Revenue canvas element:', revenueCanvas);
  console.log('Product canvas element:', productCanvas);
  
  if (revenueCanvas) {
    console.log('Revenue canvas details:', {
      width: revenueCanvas.width,
      height: revenueCanvas.height,
      clientWidth: revenueCanvas.clientWidth,
      clientHeight: revenueCanvas.clientHeight,
      offsetParent: revenueCanvas.offsetParent,
      style: revenueCanvas.style.cssText
    });
  }
  
  if (productCanvas) {
    console.log('Product canvas details:', {
      width: productCanvas.width,
      height: productCanvas.height,
      clientWidth: productCanvas.clientWidth,
      clientHeight: productCanvas.clientHeight,
      offsetParent: productCanvas.offsetParent,
      style: productCanvas.style.cssText
    });
  }
  
  // Check if tab-thong-ke is active
  const statsTab = document.getElementById('tab-thong-ke');
  console.log('Stats tab element:', statsTab);
  if (statsTab) {
    console.log('Stats tab classes:', statsTab.className);
    console.log('Stats tab display:', getComputedStyle(statsTab).display);
  }
  
  // Check charts container
  const chartsContainer = document.querySelector('.charts-container');
  console.log('Charts container:', chartsContainer);
  if (chartsContainer) {
    console.log('Charts container display:', getComputedStyle(chartsContainer).display);
  }
}

// Run debug
debugChartElements();