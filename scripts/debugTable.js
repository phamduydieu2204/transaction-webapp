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

  });

  });
  
  // Check tbody
  const tbody = table.querySelector("tbody");
  if (!tbody) {
    console.error("❌ Table tbody not found!");
    return;
  }
  
  console.log("📊 Tbody found:", {

    innerHTML: tbody.innerHTML.substring(0, 100) + "...",

  });

  });
  
  // Check parent containers
  let parent = table.parentElement;
  let level = 1;
  while (parent && level <= 5) {
    console.log(`📦 Parent Level ${level}:`, {

  });

    });
    parent = parent.parentElement;
    level++;
  }
  
  // Check if there's a table wrapper with scroll
  const tableWrapper = document.querySelector(".table-wrapper, .table-container");
  if (tableWrapper) {
    console.log("📜 Table wrapper found:", {

  });

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