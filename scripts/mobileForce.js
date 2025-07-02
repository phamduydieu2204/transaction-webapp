/**
 * Mobile Force Layout - Detect and Force Mobile Layout
 * Specifically for Chrome mobile compatibility issues
 */

(function() {
  'use strict';

  // Mobile detection function
  function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const screenWidth = window.screen.width;
    const viewportWidth = window.innerWidth;
    
    // Check multiple conditions
    const isMobileUserAgent = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isMobileScreen = screenWidth <= 768 || viewportWidth <= 768;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Galaxy S23 Ultra specific detection
    const isGalaxyS23Ultra = /SM-S918/i.test(userAgent) || screenWidth === 1440;
    
    console.log('🔍 Mobile Detection:', {
      userAgent: userAgent,
      screenWidth: screenWidth,
      viewportWidth: viewportWidth,
      isMobileUserAgent: isMobileUserAgent,
      isMobileScreen: isMobileScreen,
      isTouchDevice: isTouchDevice,
      isGalaxyS23Ultra: isGalaxyS23Ultra
    });
    
    return isMobileUserAgent || isMobileScreen || isTouchDevice || isGalaxyS23Ultra;
  }

  // Chrome mobile detection
  function isChromeOnMobile() {
    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/i.test(userAgent) && !/Edge/i.test(userAgent);
    const isMobile = isMobileDevice();
    
    console.log('🔍 Chrome Mobile Detection:', {
      isChrome: isChrome,
      isMobile: isMobile,
      userAgent: userAgent
    });
    
    return isChrome && isMobile;
  }

  // Force mobile layout function
  function forceMobileLayout() {
    console.log('📱 Forcing mobile layout...');
    
    // Add mobile class to body
    document.body.classList.add('force-mobile-layout');
    
    // Add mobile CSS directly via style
    const style = document.createElement('style');
    style.id = 'mobile-force-styles';
    style.textContent = `
      /* Target only form grids - not navigation tabs */
      .force-mobile-layout form .transaction-form-grid,
      .force-mobile-layout form .form-grid,
      .force-mobile-layout #transactionForm .transaction-form-grid,
      .force-mobile-layout #expenseForm .transaction-form-grid,
      .force-mobile-layout #softwareForm .transaction-form-grid {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        grid-template-columns: none !important;
        grid-template-rows: none !important;
      }
      
      .force-mobile-layout .transaction-form-grid .form-field,
      .force-mobile-layout .transaction-form-grid > div,
      .force-mobile-layout .form-grid .form-field,
      .force-mobile-layout .form-grid > div {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        margin-bottom: 15px !important;
        grid-column: unset !important;
        grid-row: unset !important;
        float: none !important;
        clear: both !important;
        box-sizing: border-box !important;
      }
      
      .force-mobile-layout .transaction-form-grid .form-field input,
      .force-mobile-layout .transaction-form-grid .form-field select,
      .force-mobile-layout .transaction-form-grid .form-field textarea,
      .force-mobile-layout .form-grid .form-field input,
      .force-mobile-layout .form-grid .form-field select,
      .force-mobile-layout .form-grid .form-field textarea {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        font-size: 16px !important;
        min-height: 44px !important;
        padding: 12px !important;
      }
      
      .force-mobile-layout .transaction-form-grid .form-field label,
      .force-mobile-layout .form-grid .form-field label {
        display: block !important;
        width: 100% !important;
        margin-bottom: 8px !important;
        font-weight: 600 !important;
      }
      
      .force-mobile-layout .transaction-form-grid .note-field-tall,
      .force-mobile-layout .transaction-form-grid .note-field {
        display: block !important;
        width: 100% !important;
        grid-column: unset !important;
        grid-row: unset !important;
      }
      
      .force-mobile-layout .transaction-form-grid .order-info-container {
        display: block !important;
        width: 100% !important;
      }
      
      .force-mobile-layout .transaction-form-grid .order-info-container textarea,
      .force-mobile-layout .transaction-form-grid .order-info-container select {
        display: block !important;
        width: 100% !important;
        margin-bottom: 8px !important;
      }
      
      .force-mobile-layout .transaction-form-grid .form-field-empty {
        display: none !important;
      }
    `;
    
    // Insert style at the end of head to ensure highest priority
    document.head.appendChild(style);
    
    console.log('✅ Mobile layout forced with inline styles');
  }

  // Apply mobile layout if needed
  function applyMobileLayoutIfNeeded() {
    const isMobile = isMobileDevice();
    const isChromeMobile = isChromeOnMobile();
    
    if (isMobile || isChromeMobile) {
      console.log('📱 Mobile device detected, forcing mobile layout');
      forceMobileLayout();
      
      // Also force on resize
      window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
          forceMobileLayout();
        }
      });
      
      // Force layout after DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceMobileLayout);
      } else {
        forceMobileLayout();
      }
      
      // Also force after a delay to ensure all CSS is loaded
      setTimeout(forceMobileLayout, 100);
      setTimeout(forceMobileLayout, 500);
      setTimeout(forceMobileLayout, 1000);
    }
  }

  // Initialize
  console.log('🚀 Mobile Force Layout initialized');
  applyMobileLayoutIfNeeded();

  // Export for manual triggering
  window.forceMobileLayout = forceMobileLayout;
  window.isMobileDevice = isMobileDevice;
  window.isChromeOnMobile = isChromeOnMobile;

})();