// Force full-width layout - Ultimate solution
export function forceFullWidth() {
    // Remove all width constraints from body and html
    const html = document.documentElement;
    const body = document.body;
    
    // Force html and body to full width
    html.style.cssText = `
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: auto !important;
    `;
    
    body.style.cssText = `
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
        text-align: left !important;
        overflow-x: auto !important;
    `;
    
    // Create ultra-high priority CSS
    let forceStyle = document.getElementById('ultra-force-full-width');
    if (forceStyle) forceStyle.remove();
    
    forceStyle = document.createElement('style');
    forceStyle.id = 'ultra-force-full-width';
    forceStyle.innerHTML = `
        /* ULTRA HIGH PRIORITY FULL WIDTH OVERRIDE */
        html, body {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            overflow-x: auto !important;
        }
        
        body {
            text-align: left !important;
        }
        
        .container {
            width: 100vw !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            position: relative !important;
            left: 0 !important;
            right: 0 !important;
        }
        
        .tab-contents {
            width: 100% !important;
            max-width: none !important;
            padding: 0 5px !important;
            margin: 0 !important;
            box-sizing: border-box !important;
        }
        
        .form-container {
            width: 100% !important;
            max-width: none !important;
            padding: 16px 5px !important;
            margin: 0 !important;
            box-sizing: border-box !important;
        }
        
        .table-container {
            width: 100% !important;
            max-width: none !important;
            padding: 16px 5px !important;
            margin: 0 !important;
            box-sizing: border-box !important;
        }
        
        header {
            width: 100% !important;
            max-width: none !important;
            padding: 0 5px !important;
            margin: 0 !important;
            box-sizing: border-box !important;
        }
        
        .form-container #transactionForm {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
        }
        
        table {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            table-layout: auto !important;
        }
        
        /* Force form grid to use full width */
        .form-grid {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
        }
        
        /* Override any centering or width constraints */
        * {
            max-width: none !important;
        }
        
        .container * {
            max-width: none !important;
        }
    `;
    
    document.head.appendChild(forceStyle);
    
    // Force apply inline styles to key elements
    const container = document.querySelector('.container');
    if (container) {
        container.style.cssText = `
            width: 100vw !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            position: relative !important;
            left: 0 !important;
            right: 0 !important;
        `;
    }
    
    // Force all major containers
    const elements = [
        '.tab-contents',
        '.form-container', 
        '.table-container',
        'header',
        '#transactionForm',
        'table'
    ];
    
    elements.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) {
            el.style.width = '100%';
            el.style.maxWidth = 'none';
            el.style.margin = '0';
            el.style.boxSizing = 'border-box';
        }
    });
    
    // Wait a bit then verify
    setTimeout(() => {
        const finalContainer = document.querySelector('.container');
        const finalRect = finalContainer.getBoundingClientRect();
    }, 100);
}

// Make it available globally
window.forceFullWidth = forceFullWidth;