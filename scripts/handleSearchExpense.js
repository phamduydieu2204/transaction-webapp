import { getConstants } from './constants.js';
import { showProcessingModal } from './showProcessingModal.js';
import { showResultModal } from './showResultModal.js';
import { renderExpenseStats } from './renderExpenseStats.js';

export async function handleSearchExpense() {
  showProcessingModal("Đang tìm kiếm chi phí...");
  const { BACKEND_URL } = getConstants();
  const getValue = (id) => document.getElementById(id)?.value?.trim() || "";

  // Lấy các điều kiện tìm kiếm từ form
  const conditions = {};
  
  // Chỉ thêm điều kiện nếu người dùng đã nhập giá trị
  const expenseDate = getValue("expenseDate");
  if (expenseDate && expenseDate !== "yyyy/mm/dd") conditions.expenseDate = expenseDate;
  
  const expenseCategory = getValue("expenseCategory");
  if (expenseCategory) conditions.expenseCategory = expenseCategory;
  
  const expenseSubCategory = getValue("expenseSubCategory");
  if (expenseSubCategory) conditions.expenseSubCategory = expenseSubCategory;
  
  const expenseProduct = getValue("expenseProduct");
  if (expenseProduct) conditions.expenseProduct = expenseProduct;
  
  const expensePackage = getValue("expensePackage");
  if (expensePackage) conditions.expensePackage = expensePackage;
  
  const expenseAmount = getValue("expenseAmount");
  if (expenseAmount && expenseAmount !== "0") conditions.expenseAmount = expenseAmount;
  
  const expenseCurrency = getValue("expenseCurrency");
  if (expenseCurrency) conditions.expenseCurrency = expenseCurrency;
  
  const expenseBank = getValue("expenseBank");
  if (expenseBank) conditions.expenseBank = expenseBank;
  
  const expenseCard = getValue("expenseCard");
  if (expenseCard) conditions.expenseCard = expenseCard;
  
  const expenseRecurring = getValue("expenseRecurring");
  if (expenseRecurring) conditions.expenseRecurring = expenseRecurring;
  
  const expenseRenewDate = getValue("expenseRenewDate");
  if (expenseRenewDate && expenseRenewDate !== "yyyy/mm/dd") conditions.expenseRenewDate = expenseRenewDate;
  
  const expenseSupplier = getValue("expenseSupplier");
  if (expenseSupplier) conditions.expenseSupplier = expenseSupplier;
  
  const expenseStatus = getValue("expenseStatus");
  if (expenseStatus) conditions.expenseStatus = expenseStatus;
  
  const expenseNote = getValue("expenseNote");
  if (expenseNote) conditions.expenseNote = expenseNote;

  const data = {
    action: "searchExpenses",
    maNhanVien: window.userInfo?.maNhanVien || "",
    conditions: conditions
  };

  console.log("📤 Tìm kiếm chi phí với điều kiện:", JSON.stringify(data, null, 2));

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    
    if (result.status === "success") {
      window.expenseList = result.data || [];
      window.currentExpensePage = 1;
      window.isExpenseSearching = true;
      
      // Gọi renderExpenseStats để hiển thị kết quả tìm kiếm
      renderExpenseStats();
      
      showResultModal(`Tìm kiếm thành công! Tìm thấy ${result.data.length} chi phí.`, true);
    } else {
      showResultModal(result.message || "Không thể tìm kiếm chi phí!", false);
    }
  } catch (err) {
    console.error("Lỗi khi tìm kiếm chi phí", err);
    showResultModal(`Lỗi khi tìm kiếm chi phí: ${err.message}`, false);
  }
}