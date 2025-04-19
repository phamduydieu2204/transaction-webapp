function updatePagination(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const firstButton = document.createElement("button");
  firstButton.textContent = "«";
  firstButton.onclick = () => firstPage();
  firstButton.disabled = currentPage === 1;
  pagination.appendChild(firstButton);

  const prevButton = document.createElement("button");
  prevButton.textContent = "‹";
  prevButton.onclick = () => prevPage();
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
  nextButton.onclick = () => nextPage();
  nextButton.disabled = currentPage === totalPages;
  pagination.appendChild(nextButton);

  const lastButton = document.createElement("button");
  lastButton.textContent = "»";
  lastButton.onclick = () => lastPage();
  lastButton.disabled = currentPage === totalPages;
  pagination.appendChild(lastButton);
}

function firstPage() {
  currentPage = 1;
  updateTable();
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    updateTable();
  }
}

function nextPage() {
  const totalPages = Math.ceil(transactionList.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    updateTable();
  }
}

function lastPage() {
  const totalPages = Math.ceil(transactionList.length / itemsPerPage);
  currentPage = totalPages;
  updateTable();
}

function goToPage(page) {
  currentPage = page;
  updateTable();
}
