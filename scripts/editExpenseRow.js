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

    // Điền dữ liệu vào các trường cơ bản với kiểm tra element tồn tại
    const setElementValue = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value;
      } else {
        console.warn(`Element with id "${id}" not found`);
      }
    };

    setElementValue("expenseId", e.expenseId);
    setElementValue("expenseDate", e.date);
    setElementValue("expenseDescription", e.description || "");
    setElementValue("expenseAccount", e.account || "");
    setElementValue("expenseAmount", e.amount || "");
    setElementValue("expenseCurrency", e.currency || "VND");
    setElementValue("expenseRecurring", e.recurring || "Chi một lần");
    setElementValue("expenseRenewDate", e.renew || "");
    setElementValue("expenseSupplier", e.supplier || "");
    setElementValue("expenseSource", e.source || "");
    setElementValue("expenseStatus", e.status || "Đã thanh toán");
    setElementValue("expenseNote", e.note || "");

    // Thiết lập các dropdown phụ thuộc theo thứ tự với kiểm tra element
    if (currentType) {
      setElementValue("expenseCategory", currentType);
      if (typeof handleCategoryChange === 'function') handleCategoryChange();
      
      if (currentCategory) {
        setTimeout(() => {
          setElementValue("expenseSubCategory", currentCategory);
          if (typeof handleSubCategoryChange === 'function') handleSubCategoryChange();
          
          if (currentProduct) {
            setTimeout(() => {
              setElementValue("expenseProduct", currentProduct);
              if (typeof handleProductChange === 'function') handleProductChange();
              
              if (currentPackage) {
                setTimeout(() => {
                  setElementValue("expensePackage", currentPackage);
                }, 100);
              }
            }, 100);
          }
        }, 100);
      }
    }

    // Thiết lập dropdown ngân hàng và thẻ với kiểm tra element
    if (currentBank) {
      setElementValue("expenseBank", currentBank);
      if (typeof handleBankChange === 'function') handleBankChange();
      
      if (currentCard) {
        setTimeout(() => {
          setElementValue("expenseCard", currentCard);
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
