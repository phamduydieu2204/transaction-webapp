// Debug layout width issues
function debugLayout() {
    console.log('🔍 === LAYOUT DEBUG START ===');
    
    // Viewport dimensions
    console.log('📐 Viewport:', {
  });

    });
    
    // Container element analysis
    const container = document.querySelector('.container');
    if (container) {
        const containerRect = container.getBoundingClientRect();
        const containerStyles = window.getComputedStyle(container);
        
        console.log('📦 Container:', {
            },
  });

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
        },
  });

        }
    });
    
    // HTML element analysis
    const html = document.documentElement;
    const htmlRect = html.getBoundingClientRect();
    const htmlStyles = window.getComputedStyle(html);
    
    console.log('🌐 HTML:', {
        },
  });

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
  });

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