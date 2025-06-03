// Debug layout width issues
function debugLayout() {
    console.log('🔍 === LAYOUT DEBUG START ===');
    
    // Viewport dimensions
    console.log('📐 Viewport:', {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
    });
    
    // Container element analysis
    const container = document.querySelector('.container');
    if (container) {
        const containerRect = container.getBoundingClientRect();
        const containerStyles = window.getComputedStyle(container);
        
        console.log('📦 Container:', {
            offsetWidth: container.offsetWidth,
            clientWidth: container.clientWidth,
            scrollWidth: container.scrollWidth,
            boundingRect: {
                width: containerRect.width,
                left: containerRect.left,
                right: containerRect.right
            },
            computedStyles: {
                width: containerStyles.width,
                maxWidth: containerStyles.maxWidth,
                minWidth: containerStyles.minWidth,
                margin: containerStyles.margin,
                padding: containerStyles.padding,
                boxSizing: containerStyles.boxSizing,
                position: containerStyles.position,
                display: containerStyles.display
            }
        });
    } else {
        console.log('❌ Container element not found');
    }
    
    // Body element analysis
    const body = document.body;
    const bodyRect = body.getBoundingClientRect();
    const bodyStyles = window.getComputedStyle(body);
    
    console.log('🏢 Body:', {
        offsetWidth: body.offsetWidth,
        clientWidth: body.clientWidth,
        scrollWidth: body.scrollWidth,
        boundingRect: {
            width: bodyRect.width,
            left: bodyRect.left,
            right: bodyRect.right
        },
        computedStyles: {
            width: bodyStyles.width,
            maxWidth: bodyStyles.maxWidth,
            margin: bodyStyles.margin,
            padding: bodyStyles.padding,
            overflow: bodyStyles.overflow
        }
    });
    
    // HTML element analysis
    const html = document.documentElement;
    const htmlRect = html.getBoundingClientRect();
    const htmlStyles = window.getComputedStyle(html);
    
    console.log('🌐 HTML:', {
        offsetWidth: html.offsetWidth,
        clientWidth: html.clientWidth,
        scrollWidth: html.scrollWidth,
        boundingRect: {
            width: htmlRect.width,
            left: htmlRect.left,
            right: htmlRect.right
        },
        computedStyles: {
            width: htmlStyles.width,
            maxWidth: htmlStyles.maxWidth,
            margin: htmlStyles.margin,
            padding: htmlStyles.padding,
            overflow: htmlStyles.overflow
        }
    });
    
    // Check all parent elements of container
    if (container) {
        console.log('🔗 Parent elements chain:');
        let current = container.parentElement;
        let level = 1;
        
        while (current && level <= 10) {
            const rect = current.getBoundingClientRect();
            const styles = window.getComputedStyle(current);
            
            console.log(`   Level ${level} - ${current.tagName}${current.className ? '.' + current.className : ''}:`, {
                offsetWidth: current.offsetWidth,
                clientWidth: current.clientWidth,
                boundingRect: { width: rect.width, left: rect.left, right: rect.right },
                computedStyles: {
                    width: styles.width,
                    maxWidth: styles.maxWidth,
                    margin: styles.margin,
                    padding: styles.padding,
                    display: styles.display,
                    position: styles.position
                }
            });
            
            current = current.parentElement;
            level++;
        }
    }
    
    console.log('🔍 === LAYOUT DEBUG END ===');
}

// Export the function
export { debugLayout };

// Auto-run debug when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(debugLayout, 1000);
});

// Also run when window resizes
window.addEventListener('resize', () => {
    console.log('📏 Window resized');
    debugLayout();
});

// Make it available globally for manual calls
window.debugLayout = debugLayout;