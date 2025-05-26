import { showProcessingModal } from './showProcessingModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';
import { initExpenseDropdowns } from './initExpenseDropdowns.js';

export async function editExpenseRow(e) {
  // Lưu ID expense hiện tại đang sửa
  window.currentEditExpenseId = e.expenseId;

  // Lưu các giá trị dropdown cần giữ lại
  const currentType = e.type || "";
  const currentCategory = e.category || "";
  const currentProduct = e.product || "";
  const currentPackage = e.package || "";
  const currentBank = e.bank || "";
  const currentCard = e.card || "";

  // Hiển thị modal "Đang tải"
  showProcessingModal("Đang tải dữ liệu chi phí...");

  try {
    // Khởi tạo lại dropdown để đảm bảo có đầy đủ options
    await initExpenseDropdowns();

    // Điền dữ liệu vào các trường cơ bản
    document.getElementById("expenseId").value = e.expenseId;
    document.getElementById("expenseDate").value = e.date;
    document.getElementById("expenseDescription").value = e.description || "";
    document.getElementById("expenseAccount").value = e.account || "";
    document.getElementById("expenseAmount").value = e.amount || "";
    document.getElementById("expenseCurrency").value = e.currency || "VND";
    document.getElementById("expenseRecurring").value = e.recurring || "Chi một lần";
    document.getElementById("expenseRenewDate").value = e.renew || "";
    document.getElementById("expenseSupplier").value = e.supplier || "";
    document.getElementById("expenseSource").value = e.source || "";
    document.getElementById("expenseStatus").value = e.status || "Đã thanh toán";
    document.getElementById("expenseNote").value = e.note || "";

    // Thiết lập các dropdown phụ thuộc theo thứ tự
    if (currentType) {
      document.getElementById("expenseCategory").value = currentType;
      handleCategoryChange();
      
      if (currentCategory) {
        setTimeout(() => {
          document.getElementById("expenseSubCategory").value = currentCategory;
          handleSubCategoryChange();
          
          if (currentProduct) {
            setTimeout(() => {
              document.getElementById("expenseProduct").value = currentProduct;
              handleProductChange();
              
              if (currentPackage) {
                setTimeout(() => {
                  document.getElementById("expensePackage").value = currentPackage;
                }, 100);
              }
            }, 100);
          }
        }, 100);
      }
    }

    // Thiết lập dropdown ngân hàng và thẻ
    if (currentBank) {
      document.getElementById("expenseBank").value = currentBank;
      handleBankChange();
      
      if (currentCard) {
        setTimeout(() => {
          document.getElementById("expenseCard").value = currentCard;
        }, 100);
      }
    }

    // Đóng modal sau khi load xong
    closeProcessingModal();
    
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu chi phí:", error);
    closeProcessingModal();
    alert("❌ Có lỗi khi tải dữ liệu chi phí. Vui lòng thử lại.");
  }
}
