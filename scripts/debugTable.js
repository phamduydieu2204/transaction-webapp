/**
 * Debug table visibility issues
 */
export function debugTable() {
  console.log("🔍 === TABLE DEBUG START ===");
  
  // Check table element
  const table = document.querySelector("#transactionTable");
  if (!table) {
    console.error("❌ Table #transactionTable not found!");
    return;
  }
  
  console.log("📊 Table found:", {
    id: table.id,
    className: table.className,
    display: window.getComputedStyle(table).display,
    visibility: window.getComputedStyle(table).visibility,
    opacity: window.getComputedStyle(table).opacity,
    height: window.getComputedStyle(table).height,
    overflow: window.getComputedStyle(table).overflow
  });
  
  // Check tbody
  const tbody = table.querySelector("tbody");
  if (!tbody) {
    console.error("❌ Table tbody not found!");
    return;
  }
  
  console.log("📊 Tbody found:", {
    childCount: tbody.children.length,
    innerHTML: tbody.innerHTML.substring(0, 100) + "...",
    display: window.getComputedStyle(tbody).display,
    visibility: window.getComputedStyle(tbody).visibility
  });
  
  // Check parent containers
  let parent = table.parentElement;
  let level = 1;
  while (parent && level <= 5) {
    console.log(`📦 Parent Level ${level}:`, {
      tagName: parent.tagName,
      id: parent.id,
      className: parent.className,
      display: window.getComputedStyle(parent).display,
      visibility: window.getComputedStyle(parent).visibility,
      overflow: window.getComputedStyle(parent).overflow,
      height: window.getComputedStyle(parent).height
    });
    parent = parent.parentElement;
    level++;
  }
  
  // Check if there's a table wrapper with scroll
  const tableWrapper = document.querySelector(".table-wrapper, .table-container");
  if (tableWrapper) {
    console.log("📜 Table wrapper found:", {
      className: tableWrapper.className,
      overflow: window.getComputedStyle(tableWrapper).overflow,
      maxHeight: window.getComputedStyle(tableWrapper).maxHeight,
      height: window.getComputedStyle(tableWrapper).height
    });
  }
  
  console.log("🔍 === TABLE DEBUG END ===");
}

// Auto-run after a delay
setTimeout(() => {
  debugTable();
}, 2000);

// Make available globally
window.debugTable = debugTable;