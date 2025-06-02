/**
 * chartConfig.js
 * 
 * Chart settings, themes, and responsive configurations
 * Centralized configuration for chart appearance and behavior
 */

/**
 * Chart color schemes
 */
export const CHART_COLORS = {
  revenue: {
    primary: '#28a745',
    secondary: '#20c997',
    gradient: 'linear-gradient(135deg, #28a745, #20c997)',
    area: 'rgba(40, 167, 69, 0.2)'
  },
  expense: {
    primary: '#dc3545',
    secondary: '#fd7e14',
    gradient: 'linear-gradient(135deg, #dc3545, #fd7e14)',
    area: 'rgba(220, 53, 69, 0.2)'
  },
  profit: {
    positive: '#17a2b8',
    negative: '#6c757d',
    gradient: 'linear-gradient(135deg, #17a2b8, #20c997)',
    area: 'rgba(23, 162, 184, 0.3)'
  },
  comparison: {
    previous: '#6f42c1',
    current: '#007bff',
    highlight: '#ffc107'
  },
  neutral: {
    grid: '#e0e0e0',
    text: '#6c757d',
    background: '#f8f9fa'
  }
};

/**
 * Chart dimensions and responsive breakpoints
 */
export const CHART_DIMENSIONS = {
  default: {
    width: 1000,
    height: 400,
    margin: {
      top: 20,
      right: 30,
      bottom: 40,
      left: 60
    }
  },
  mobile: {
    width: 350,
    height: 250,
    margin: {
      top: 15,
      right: 20,
      bottom: 30,
      left: 40
    }
  },
  tablet: {
    width: 600,
    height: 300,
    margin: {
      top: 18,
      right: 25,
      bottom: 35,
      left: 50
    }
  }
};

/**
 * Typography settings
 */
export const CHART_TYPOGRAPHY = {
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: 'normal',
    color: '#666',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  axis: {
    fontSize: '12px',
    fontWeight: 'normal',
    color: '#6c757d',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  legend: {
    fontSize: '13px',
    fontWeight: 'normal',
    color: '#333',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  tooltip: {
    fontSize: '12px',
    fontWeight: 'normal',
    color: '#333',
    fontFamily: 'Inter, system-ui, sans-serif'
  }
};

/**
 * Animation settings
 */
export const CHART_ANIMATIONS = {
  duration: {
    fast: 200,
    medium: 400,
    slow: 800
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  delays: {
    stagger: 50,
    tooltip: 100
  }
};

/**
 * Interactive settings
 */
export const CHART_INTERACTIONS = {
  hover: {
    pointRadius: 7,
    lineWidth: 4,
    opacity: 0.8,
    transition: CHART_ANIMATIONS.duration.fast
  },
  tooltip: {
    showDelay: CHART_ANIMATIONS.delays.tooltip,
    hideDelay: 200,
    offset: { x: 10, y: -10 },
    maxWidth: 300,
    borderRadius: 8,
    padding: 12
  },
  zoom: {
    enabled: true,
    minScale: 0.5,
    maxScale: 3,
    sensitivity: 0.1
  }
};

/**
 * Chart themes
 */
export const CHART_THEMES = {
  default: {
    name: 'Default Light',
    colors: CHART_COLORS,
    background: '#ffffff',
    gridColor: '#e0e0e0',
    textColor: '#333333',
    borderColor: '#dee2e6'
  },
  dark: {
    name: 'Dark Mode',
    colors: {
      ...CHART_COLORS,
      neutral: {
        grid: '#404040',
        text: '#e0e0e0',
        background: '#1a1a1a'
      }
    },
    background: '#2d3748',
    gridColor: '#404040',
    textColor: '#e2e8f0',
    borderColor: '#4a5568'
  },
  highContrast: {
    name: 'High Contrast',
    colors: {
      revenue: {
        primary: '#00ff00',
        secondary: '#00cc00',
        area: 'rgba(0, 255, 0, 0.2)'
      },
      expense: {
        primary: '#ff0000',
        secondary: '#cc0000',
        area: 'rgba(255, 0, 0, 0.2)'
      },
      profit: {
        positive: '#0099ff',
        negative: '#666666',
        area: 'rgba(0, 153, 255, 0.3)'
      }
    },
    background: '#ffffff',
    gridColor: '#cccccc',
    textColor: '#000000',
    borderColor: '#000000'
  }
};

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1200
};

/**
 * Get chart configuration based on container size
 * @param {number} containerWidth - Container width in pixels
 * @param {string} theme - Theme name
 * @returns {Object} Chart configuration
 */
export function getChartConfig(containerWidth, theme = 'default') {
  let dimensions;
  
  if (containerWidth <= BREAKPOINTS.mobile) {
    dimensions = CHART_DIMENSIONS.mobile;
  } else if (containerWidth <= BREAKPOINTS.tablet) {
    dimensions = CHART_DIMENSIONS.tablet;
  } else {
    dimensions = CHART_DIMENSIONS.default;
  }
  
  const selectedTheme = CHART_THEMES[theme] || CHART_THEMES.default;
  
  return {
    dimensions,
    theme: selectedTheme,
    typography: CHART_TYPOGRAPHY,
    animations: CHART_ANIMATIONS,
    interactions: CHART_INTERACTIONS,
    colors: selectedTheme.colors
  };
}

/**
 * Generate CSS styles for chart container
 * @param {Object} config - Chart configuration
 * @returns {string} CSS styles
 */
export function generateChartStyles(config) {
  return `
    .revenue-expense-chart {
      background: ${config.theme.background};
      border: 1px solid ${config.theme.borderColor};
      border-radius: 8px;
      padding: 20px;
      font-family: ${config.typography.title.fontFamily};
      color: ${config.theme.textColor};
    }
    
    .chart-header h3 {
      font-size: ${config.typography.title.fontSize};
      font-weight: ${config.typography.title.fontWeight};
      color: ${config.theme.textColor};
      margin: 0 0 15px 0;
    }
    
    .chart-legend .legend-item {
      font-size: ${config.typography.legend.fontSize};
      color: ${config.theme.textColor};
    }
    
    .chart-y-axis .y-label,
    .chart-x-axis .x-label {
      font-size: ${config.typography.axis.fontSize};
      color: ${config.colors.neutral.text};
    }
    
    .chart-tooltip .tooltip-content {
      background: ${config.theme.background};
      border: 1px solid ${config.theme.borderColor};
      border-radius: ${config.interactions.tooltip.borderRadius}px;
      padding: ${config.interactions.tooltip.padding}px;
      font-size: ${config.typography.tooltip.fontSize};
      max-width: ${config.interactions.tooltip.maxWidth}px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .revenue-line {
      stroke: ${config.colors.revenue.primary};
      transition: all ${config.animations.duration.fast}ms ${config.animations.easing.easeOut};
    }
    
    .expense-line {
      stroke: ${config.colors.expense.primary};
      transition: all ${config.animations.duration.fast}ms ${config.animations.easing.easeOut};
    }
    
    .data-point {
      transition: all ${config.animations.duration.fast}ms ${config.animations.easing.bounce};
    }
    
    .data-point:hover {
      r: ${config.interactions.hover.pointRadius};
      opacity: ${config.interactions.hover.opacity};
    }
    
    .profit-area {
      fill: ${config.colors.profit.area};
    }
    
    .grid-line {
      stroke: ${config.colors.neutral.grid};
    }
  `;
}

/**
 * Get responsive chart configuration
 * @param {Element} container - Chart container element
 * @param {string} theme - Theme name
 * @returns {Object} Responsive configuration
 */
export function getResponsiveConfig(container, theme = 'default') {
  const containerWidth = container.getBoundingClientRect().width;
  const config = getChartConfig(containerWidth, theme);
  
  // Adjust for very small containers
  if (containerWidth < 300) {
    config.dimensions.height = Math.max(200, containerWidth * 0.6);
    config.typography.title.fontSize = '14px';
    config.typography.axis.fontSize = '10px';
  }
  
  return config;
}

/**
 * Legend configuration options
 */
export const LEGEND_CONFIG = {
  position: {
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right',
    topRight: 'top-right',
    topLeft: 'top-left'
  },
  layout: {
    horizontal: 'horizontal',
    vertical: 'vertical'
  },
  alignment: {
    start: 'start',
    center: 'center',
    end: 'end'
  }
};

/**
 * Tooltip configuration options
 */
export const TOOLTIP_CONFIG = {
  trigger: {
    hover: 'hover',
    click: 'click',
    focus: 'focus'
  },
  position: {
    auto: 'auto',
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right'
  },
  format: {
    currency: 'currency',
    percentage: 'percentage',
    number: 'number',
    date: 'date'
  }
};

/**
 * Export configuration options
 */
export const EXPORT_CONFIG = {
  formats: ['png', 'svg', 'pdf', 'csv', 'excel'],
  quality: {
    low: 0.5,
    medium: 0.8,
    high: 1.0
  },
  sizes: {
    thumbnail: { width: 400, height: 200 },
    standard: { width: 800, height: 400 },
    large: { width: 1200, height: 600 },
    poster: { width: 1920, height: 1080 }
  }
};

/**
 * Accessibility configuration
 */
export const A11Y_CONFIG = {
  enableKeyboardNavigation: true,
  enableScreenReader: true,
  colorBlindSafe: true,
  highContrast: false,
  reducedMotion: false,
  focusIndicator: {
    color: '#007bff',
    width: 2,
    style: 'solid'
  }
};

// Make configurations available globally for backward compatibility
window.CHART_COLORS = CHART_COLORS;
window.CHART_DIMENSIONS = CHART_DIMENSIONS;
window.CHART_TYPOGRAPHY = CHART_TYPOGRAPHY;
window.CHART_ANIMATIONS = CHART_ANIMATIONS;
window.CHART_INTERACTIONS = CHART_INTERACTIONS;
window.CHART_THEMES = CHART_THEMES;
window.BREAKPOINTS = BREAKPOINTS;
window.getChartConfig = getChartConfig;
window.generateChartStyles = generateChartStyles;
window.getResponsiveConfig = getResponsiveConfig;
window.LEGEND_CONFIG = LEGEND_CONFIG;
window.TOOLTIP_CONFIG = TOOLTIP_CONFIG;
window.EXPORT_CONFIG = EXPORT_CONFIG;
window.A11Y_CONFIG = A11Y_CONFIG;