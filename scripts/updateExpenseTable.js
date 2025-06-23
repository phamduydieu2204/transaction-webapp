/**
 * Update Expense Table
 * Render expense data to table with pagination
 */
  // Execute action based on selection
  }
  
  // Format dates
    : '<span style="color: #6c757d;">✗ Không</span>';
  
  // 5. Thông tin khoản chi (gộp 4 trường)
  });

  }).format(amount);
}

/**
 * Update expense pagination - Sử dụng component giống transaction table
 */
function updateExpensePagination(totalPages, currentPage) {
  const pagination = document.getElementById("expensePagination");
  if (!pagination) return;

  pagination.innerHTML = "";

  // Thêm nút "Tất cả" nếu đang trong trạng thái tìm kiếm
  if (window.isExpenseSearching) {
    const allBtn = document.createElement("button");
    allBtn.textContent = "Tất cả";
    allBtn.className = "pagination-btn all-btn";
    allBtn.addEventListener("click", () => {
      window.isExpenseSearching = false;
      window.currentExpensePage = 1;
      updateExpenseTable();
    });
    pagination.appendChild(allBtn);
  }

  if (totalPages <= 1) return;

  // First button
  const firstButton = document.createElement("button");
  firstButton.textContent = "«";
  firstButton.className = "pagination-btn";
  firstButton.onclick = expenseFirstPage;
  firstButton.disabled = currentPage === 1;
  pagination.appendChild(firstButton);

  // Previous button
  const prevButton = document.createElement("button");
  prevButton.textContent = "‹";
  prevButton.className = "pagination-btn";
  prevButton.onclick = expensePrevPage;
  prevButton.disabled = currentPage === 1;
  pagination.appendChild(prevButton);

  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.className = "pagination-dots";
    pagination.appendChild(dots);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.className = "pagination-btn";
    pageButton.onclick = () => expenseGoToPage(i);
    if (i === currentPage) {
      pageButton.classList.add("active");
    }
    pagination.appendChild(pageButton);
  }

  if (endPage < totalPages) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.className = "pagination-dots";
    pagination.appendChild(dots);
  }

  // Next button
  const nextButton = document.createElement("button");
  nextButton.textContent = "›";
  nextButton.className = "pagination-btn";
  nextButton.onclick = expenseNextPage;
  nextButton.disabled = currentPage === totalPages;
  pagination.appendChild(nextButton);

  // Last button
  const lastButton = document.createElement("button");
  lastButton.textContent = "»";
  lastButton.className = "pagination-btn";
  lastButton.onclick = expenseLastPage;
  lastButton.disabled = currentPage === totalPages;
  pagination.appendChild(lastButton);
}