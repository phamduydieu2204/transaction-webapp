import { getConstants } from './constants.js';
import { showProcessingModal } from './showProcessingModal.js';
import { showResultModal } from './showResultModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';
import { renderExpenseStats } from './renderExpenseStats.js';

export async function handleSearchExpense() {
  showProcessingModal("Đang tìm kiếm chi phí...");
  const { BACKEND_URL } = getConstants();
  const getValue = (id) => document.getElementById(id)?.value?.trim() || "";
  
  // Kiểm tra có phải admin không
  const isAdmin = window.userInfo && window.userInfo.vaiTro && window.userInfo.vaiTro.toLowerCase() === "admin";
  
  if (!isAdmin) {
    console.log("⚠️ Không phải admin - một số điều kiện tìm kiếm chi phí sẽ bị bỏ qua: ngày chi phí, sản phẩm, gói");
  }

  // Lấy các điều kiện tìm kiếm từ form
  const conditions = {};
  
  // Chỉ thêm điều kiện nếu người dùng đã nhập giá trị (và đối với một số field chỉ admin mới được tìm)
  const expenseDate = isAdmin ? getValue("expenseDate") : "";
  if (expenseDate && expenseDate !== "yyyy/mm/dd") conditions.expenseDate = expenseDate;
  
  const expenseCategory = getValue("expenseCategory");
  if (expenseCategory) conditions.expenseCategory = expenseCategory;
  
  const expenseSubCategory = getValue("expenseSubCategory");
  if (expenseSubCategory) conditions.expenseSubCategory = expenseSubCategory;
  
  const expenseProduct = isAdmin ? getValue("expenseProduct") : "";
  if (expenseProduct) conditions.expenseProduct = expenseProduct;
  
  const expensePackage = isAdmin ? getValue("expensePackage") : "";
  if (expensePackage) conditions.expensePackage = expensePackage;
  
  const expenseAmount = getValue("expenseAmount");
  if (expenseAmount && expenseAmount !== "0") conditions.expenseAmount = expenseAmount;
  
  const expenseCurrency = getValue("expenseCurrency");
  // Chỉ thêm nếu không phải giá trị mặc định tìm kiếm
  if (expenseCurrency && expenseCurrency !== "") conditions.expenseCurrency = expenseCurrency;
  
  const expenseBank = getValue("expenseBank");
  if (expenseBank) conditions.expenseBank = expenseBank;
  
  const expenseCard = getValue("expenseCard");
  if (expenseCard) conditions.expenseCard = expenseCard;
  
  const expenseRecurring = getValue("expenseRecurring");
  // Chỉ thêm nếu không phải giá trị mặc định tìm kiếm
  if (expenseRecurring && expenseRecurring !== "") conditions.expenseRecurring = expenseRecurring;
  
  const expenseRenewDate = getValue("expenseRenewDate");
  if (expenseRenewDate && expenseRenewDate !== "yyyy/mm/dd") conditions.expenseRenewDate = expenseRenewDate;
  
  const expenseSupplier = getValue("expenseSupplier");
  if (expenseSupplier) conditions.expenseSupplier = expenseSupplier;
  
  const expenseStatus = getValue("expenseStatus");
  // Chỉ thêm nếu không phải giá trị mặc định tìm kiếm
  if (expenseStatus && expenseStatus !== "") conditions.expenseStatus = expenseStatus;
  
  const expenseNote = getValue("expenseNote");
  if (expenseNote) conditions.expenseNote = expenseNote;

  // Kiểm tra nếu không có điều kiện nào được nhập
  const hasConditions = Object.keys(conditions).length > 0;
  
  if (!hasConditions) {
    console.log("📋 Không có điều kiện tìm kiếm - sẽ lấy tất cả chi phí");
  }

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
    closeProcessingModal();
    
    if (result.status === "success") {
      window.expenseList = result.data || [];
      window.currentExpensePage = 1;
      window.isExpenseSearching = hasConditions; // Chỉ đánh dấu là đang tìm kiếm nếu có điều kiện
      
      // Cập nhật table ngay lập tức
      if (typeof window.updateExpenseTable === 'function') {
        window.updateExpenseTable();
      }
      
      // Gọi renderExpenseStats để hiển thị kết quả
      renderExpenseStats();
      
      // Thông báo khác nhau tùy theo có điều kiện tìm kiếm hay không
      if (hasConditions) {
        showResultModal(`Tìm kiếm thành công! Tìm thấy ${result.data.length} chi phí phù hợp.`, true);
      } else {
        showResultModal(`Đã tải ${result.data.length} chi phí.`, true);
      }
    } else {
      showResultModal(result.message || "Không thể tìm kiếm chi phí!", false);
    }
  } catch (err) {
    console.error("Lỗi khi tìm kiếm chi phí", err);
    showResultModal(`Lỗi khi tìm kiếm chi phí: ${err.message}`, false);
  }
}