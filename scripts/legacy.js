export function editRow(index, transactionList) {
    const t = transactionList[index];
    document.getElementById("transactionType").value = t.transactionType || '';
    document.getElementById("customerName").value = t.customerName || '';
    document.getElementById("customerEmail").value = t.customerEmail || '';
    document.getElementById("customerPhone").value = t.customerPhone || '';
    document.getElementById("softwareName").value = t.softwareName || '';
    document.getElementById("softwarePackage").value = t.softwarePackage || '';
    document.getElementById("duration").value = t.duration || '';
    document.getElementById("startDate").value = t.startDate || '';
    document.getElementById("endDate").value = t.endDate || '';
    document.getElementById("revenue").value = t.revenue || '';
    document.getElementById("deviceCount").value = t.deviceCount || '';
    document.getElementById("note").value = t.note || '';
    window.currentEditIndex = index;
  }
  
  export function deleteRow(index, deleteTransaction) {
    deleteTransaction(index);
  }