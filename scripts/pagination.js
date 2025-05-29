export function updatePagination(totalPages, currentPage, firstPage, prevPage, nextPage, lastPage, goToPage) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";
  
    const firstButton = document.createElement("button");
    firstButton.textContent = "«";
    firstButton.onclick = firstPage;
    firstButton.disabled = currentPage === 1;
    pagination.appendChild(firstButton);
  
    const prevButton = document.createElement("button");
    prevButton.textContent = "‹";
    prevButton.onclick = prevPage;
    prevButton.disabled = currentPage === 1;
    pagination.appendChild(prevButton);
  
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
  
    if (startPage > 1) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.style.padding = "4px 8px";
      pagination.appendChild(dots);
    }
  
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      pageButton.onclick = () => goToPage(i);
      if (i === currentPage) {
        pageButton.classList.add("active");
      }
      pagination.appendChild(pageButton);
    }
  
    if (endPage < totalPages) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.style.padding = "4px 8px";
      pagination.appendChild(dots);
    }
  
    const nextButton = document.createElement("button");
    nextButton.textContent = "›";
    nextButton.onclick = nextPage;
    nextButton.disabled = currentPage === totalPages;
    pagination.appendChild(nextButton);
  
    const lastButton = document.createElement("button");
    lastButton.textContent = "»";
    lastButton.onclick = lastPage;
    lastButton.disabled = currentPage === totalPages;
    pagination.appendChild(lastButton);
  }
  
  export function firstPage(updateTable) {
    window.currentPage = 1;
    updateTable();
  }
  
  export function prevPage(updateTable) {
    if (window.currentPage > 1) {
      window.currentPage--;
      updateTable();
    }
  }
  
  export function nextPage(updateTable, itemsPerPage) {
    const totalPages = Math.ceil(window.transactionList.length / itemsPerPage);
    if (window.currentPage < totalPages) {
      window.currentPage++;
      updateTable();
    }
  }
  
  export function lastPage(updateTable, itemsPerPage) {
    const totalPages = Math.ceil(window.transactionList.length / itemsPerPage);
    window.currentPage = totalPages;
    updateTable();
  }
  
  export function goToPage(page, updateTable) {
    window.currentPage = page;
    updateTable();
  }