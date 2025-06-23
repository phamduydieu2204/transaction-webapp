// Debug layout width issues
function debugLayout() {
    console.log('🔍 === LAYOUT DEBUG START ===');
    
    // Viewport dimensions
    console.log('📐 Viewport:', {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY
    });
    
    // Container element analysis
    const container = document.querySelector('.container');
    if (container) {
        const containerRect = container.getBoundingClientRect();
        const containerStyles = window.getComputedStyle(container);
        
        console.log('📦 Container:', {
            boundingRect: {
                width: containerRect.width,
                height: containerRect.height,
                left: containerRect.left,
                right: containerRect.right,
                top: containerRect.top,
                bottom: containerRect.bottom
            },
            computedStyles: {
                width: containerStyles.width,
                maxWidth: containerStyles.maxWidth,
                margin: containerStyles.margin,
                padding: containerStyles.padding,
                boxSizing: containerStyles.boxSizing,
                overflow: containerStyles.overflow,
                position: containerStyles.position
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
        boundingRect: {
            width: bodyRect.width,
            height: bodyRect.height
        },
        computedStyles: {
            width: bodyStyles.width,
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
        boundingRect: {
            width: htmlRect.width,
            height: htmlRect.height
        },
        computedStyles: {
            width: htmlStyles.width,
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
                boundingRect: { width: rect.width, left: rect.left, right: rect.right },
                computedStyles: {
                    width: styles.width,
                    maxWidth: styles.maxWidth,
                    overflow: styles.overflow
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