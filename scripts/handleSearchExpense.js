import { getConstants } from './constants.js';
import { showProcessingModal } from './showProcessingModal.js';
import { showResultModal } from './showResultModal.js';
import { updateTable } from './updateTable.js';

export async function handleSearchExpense(userInfo, transactionList, formatDate, editTransaction, deleteTransaction, viewTransaction) {
  if (!userInfo || !userInfo.duocTimKiemGiaoDichCuaAi) {
    showResultModal("Thiếu thông tin quyền tìm kiếm. Vui lòng đăng nhập lại.", false);
    return;
  }

  showProcessingModal("Đang tìm kiếm chi phí...");
  const { BACKEND_URL } = getConstants();
  const getValue = (id) => document.getElementById(id)?.value?.trim() || "";

  const conditions = {
    expenseDate: getValue("expenseDate"),
    expenseCategory: getValue("expenseCategory"),
    expenseSubCategory: getValue("expenseSubCategory"),
    expenseProduct: getValue("expenseProduct"),
    expensePackage: getValue("expensePackage"),
    expenseCurrency: getValue("expenseCurrency"),
    expenseBank: getValue("expenseBank"),
    expenseCard: getValue("expenseCard"),
    expenseRecurring: getValue("expenseRecurring"),
    expenseRenewDate: getValue("expenseRenewDate"),
    expenseSupplier: getValue("expenseSupplier"),
    expenseStatus: getValue("expenseStatus"),
    expenseNote: getValue("expenseNote")
  };

  const data = {
    action: "searchExpenses",
    maNhanVien: window.userInfo?.maNhanVien || "",
    duocTimKiemGiaoDichCuaAi: userInfo.duocTimKiemGiaoDichCuaAi || "chỉ bản thân",
    conditions
  };

  console.log("📤 Tìm kiếm chi phí với điều kiện:", data);

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    window.currentExpensePage = 1;
    window.isSearching = true;
    
    if (result.status === "success") {
      window.expenseList = result.data || [];
      // Ánh xạ dữ liệu chi phí sang định dạng giao dịch
      const mappedTransactionList = window.expenseList.map(expense => ({
        transactionId: expense.expenseId || "",
        transactionDate: expense.date || "",
        transactionType: expense.type || "",
        customerName: expense.supplier || "",
        customerEmail: "",
        customerPhone: "",
        duration: "",
        startDate: "",
        endDate: expense.renew || "",
        deviceCount: "",
        softwareName: expense.product || "",
        softwarePackage: expense.package || "",
        accountName: "",
        revenue: expense.amount ? `${expense.amount} ${expense.currency}` : "",
        note: expense.note || "",
        tenNhanVien: "",
        maNhanVien: data.maNhanVien || ""
      }));

      window.transactionList = mappedTransactionList;
      window.currentPage = 1;
      updateTable(
        window.transactionList,
        window.currentPage,
        window.itemsPerPage || 10,
        formatDate,
        editTransaction,
        deleteTransaction,
        viewTransaction
      );

      showResultModal(`Tìm kiếm thành công! Tìm thấy ${result.data.length} chi phí.`, true);
    } else {
      showResultModal(result.message || "Không thể tìm kiếm chi phí!", false);
    }
  } catch (err) {
    showResultModal(`Lỗi khi tìm kiếm chi phí: ${err.message}`, false);
  }
}