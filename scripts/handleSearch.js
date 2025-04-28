import { updateTable } from './updateTable.js';

export function handleSearch(userInfo, transactionList, showProcessingModal, showResultModal, updateTable, formatDate, editTransaction, deleteTransaction, viewTransaction) {
  const searchInput = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!searchInput) {
    window.isSearching = false;
    updateTable(window.transactionList, window.currentPage, window.itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction);
    return;
  }

  window.isSearching = true;
  
  const giaoDichNhinThay = (userInfo.giaoDichNhinThay || "").toLowerCase().split(",").map(t => t.trim());
  const nhinThayGiaoDichCuaAi = (userInfo.nhinThayGiaoDichCuaAi || "chỉ bản thân").toLowerCase();

  const filtered = transactionList.filter(transaction => {
    const customerName = (transaction.customerName || "").toLowerCase();
    const transactionType = (transaction.transactionType || "").toLowerCase();
    const maNhanVien = (transaction.maNhanVien || "").toLowerCase();
    const searchMatch = customerName.includes(searchInput);

    const transactionTypeAllowed = giaoDichNhinThay.length === 0 || giaoDichNhinThay.includes(transactionType);

    const scopeAllowed = nhinThayGiaoDichCuaAi === "tất cả" || (userInfo.maNhanVien && userInfo.maNhanVien.toLowerCase() === maNhanVien);

    return searchMatch && transactionTypeAllowed && scopeAllowed;
  });

  window.transactionList = filtered;
  window.currentPage = 1;
  updateTable(window.transactionList, window.currentPage, window.itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction);
}
