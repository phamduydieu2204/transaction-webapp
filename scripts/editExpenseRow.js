export function editExpenseRow(e) {
  document.getElementById("expenseId").value = e.expenseId;
  document.getElementById("expenseDate").value = e.date;
  document.getElementById("expenseCategory").value = e.type;
  handleCategoryChange();
  setTimeout(() => {
    document.getElementById("expenseSubCategory").value = e.category;
    handleSubCategoryChange();
    setTimeout(() => {
      document.getElementById("expenseProduct").value = e.product;
      handleProductChange();
      setTimeout(() => {
        document.getElementById("expensePackage").value = e.package || "";
      }, 100);
    }, 100);
  }, 100);

  document.getElementById("expenseDescription").value = e.description || "";
  document.getElementById("expenseAccount").value = e.account || "";
  document.getElementById("expenseAmount").value = e.amount || "";
  document.getElementById("expenseCurrency").value = e.currency || "VND";
  document.getElementById("expenseBank").value = e.bank || "";
  handleBankChange();
  setTimeout(() => {
    document.getElementById("expenseCard").value = e.card || "";
  }, 100);

  document.getElementById("expenseRecurring").value = e.recurring || "Chi một lần";
  document.getElementById("expenseRenewDate").value = e.renew || "";
  document.getElementById("expenseSupplier").value = e.supplier || "";
  document.getElementById("expenseSource").value = e.source || "";
  document.getElementById("expenseStatus").value = e.status || "Đã thanh toán";
  document.getElementById("expenseNote").value = e.note || "";

  alert("✅ Đã tải dữ liệu lên form. Bạn có thể chỉnh sửa và bấm Cập nhật.");
}
