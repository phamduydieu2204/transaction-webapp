import { updateTable } from './updateTable.js';

export function handleSearch(userInfo, transactionList, showProcessingModal, showResultModal, updateTable, formatDate, editTransaction, deleteTransaction, viewTransaction) {
  const searchInput = document.getElementById("searchInput").value.trim().toLowerCase();

  if (!searchInput) {
    window.isSearching = false;
    updateTable(window.transactionList, window.currentPage, window.itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction);
    return;
  }

  window.isSearching = true;

  const isDateSearch = /^\d{4}(\/\d{2})?(\/\d{2})?$/.test(searchInput);

  const filtered = transactionList.filter(transaction => {
    const fieldsToSearch = [
      transaction.transactionId,
      transaction.transactionType,
      transaction.customerName,
      transaction.customerEmail,
      transaction.customerPhone,
      transaction.duration,
      transaction.deviceCount,
      transaction.softwareName,
      transaction.softwarePackage,
      transaction.accountName,
      transaction.revenue,
      transaction.note,
      transaction.tenNhanVien,
      transaction.maNhanVien
    ];

    const basicMatch = fieldsToSearch.some(field => {
      if (field !== undefined && field !== null) {
        return String(field).toLowerCase().includes(searchInput);
      }
      return false;
    });

    if (isDateSearch) {
      const transactionDate = (transaction.transactionDate || "").toLowerCase();
      const startDate = (transaction.startDate || "").toLowerCase();
      const endDate = (transaction.endDate || "").toLowerCase();

      // Tất cả các trường ngày phải cùng khớp điều kiện nhập vào
      const dateMatch =
        transactionDate.startsWith(searchInput) &&
        startDate.startsWith(searchInput) &&
        endDate.startsWith(searchInput);

      return basicMatch && dateMatch;
    } else {
      return basicMatch;
    }
  });

  window.transactionList = filtered;
  window.currentPage = 1;
  updateTable(window.transactionList, window.currentPage, window.itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction);
}
