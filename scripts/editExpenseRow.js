export function editExpenseRow(e) {
  console.log("🔧 editExpenseRow được gọi với dữ liệu:", e);
  
  // ✅ Hàm chuẩn hóa ngày từ nhiều format khác nhau (giống logic trong renderExpenseStats)
  const normalizeDate = (dateInput) => {
    if (!dateInput) return "";
    
    let date;
    if (typeof dateInput === 'string') {
      // Nếu là ISO string như "2025-05-21T17:00:00.000Z"
      if (dateInput.includes('T')) {
        date = new Date(dateInput);
      } 
      // Nếu là format "2025/05/23"
      else if (dateInput.includes('/')) {
        const [y, m, d] = dateInput.split('/');
        date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      }
      // Các format khác
      else {
        date = new Date(dateInput);
      }
    } else {
      date = new Date(dateInput);
    }
    
    if (isNaN(date.getTime())) return "";
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  };

  // ✅ Điền dữ liệu vào form (sử dụng tên field chính xác từ backend)
  document.getElementById("expenseId").value = e.expenseId || "";
  document.getElementById("expenseDate").value = normalizeDate(e.date);
  
  // ✅ Set dropdown values và trigger events để cập nhật các dropdown con
  const categorySelect = document.getElementById("expenseCategory");
  if (categorySelect) {
    categorySelect.value = e.type || "";
    // Trigger event để cập nhật sub-category dropdown
    if (typeof window.handleCategoryChange === 'function') {
      window.handleCategoryChange();
    }
  }

  // ✅ Sử dụng setTimeout để đảm bảo dropdown được cập nhật trước khi set value
  setTimeout(() => {
    const subCategorySelect = document.getElementById("expenseSubCategory");
    if (subCategorySelect) {
      subCategorySelect.value = e.category || "";
      // Trigger event để cập nhật product dropdown
      if (typeof window.handleSubCategoryChange === 'function') {
        window.handleSubCategoryChange();
      }
    }

    setTimeout(() => {
      const productSelect = document.getElementById("expenseProduct");
      if (productSelect) {
        productSelect.value = e.product || "";
        // Trigger event để cập nhật package dropdown
        if (typeof window.handleProductChange === 'function') {
          window.handleProductChange();
        }
      }

      setTimeout(() => {
        const packageSelect = document.getElementById("expensePackage");
        if (packageSelect) {
          packageSelect.value = e.package || "";
        }
      }, 100);
    }, 100);
  }, 100);

  // ✅ Điền các trường khác
  document.getElementById("expenseAmount").value = e.amount || "";
  document.getElementById("expenseCurrency").value = e.currency || "VND";
  
  // ✅ Set ngân hàng và trigger event để cập nhật card dropdown
  const bankSelect = document.getElementById("expenseBank");
  if (bankSelect) {
    bankSelect.value = e.bank || "";
    if (typeof window.handleBankChange === 'function') {
      window.handleBankChange();
    }
  }

  setTimeout(() => {
    const cardSelect = document.getElementById("expenseCard");
    if (cardSelect) {
      cardSelect.value = e.card || "";
    }
  }, 100);

  document.getElementById("expenseRecurring").value = e.recurring || "Chi một lần";
  document.getElementById("expenseRenewDate").value = normalizeDate(e.renew);
  document.getElementById("expenseSupplier").value = e.supplier || "";
  document.getElementById("expenseStatus").value = e.status || "Đã thanh toán";
  document.getElementById("expenseNote").value = e.note || "";

  // ✅ Hiển thị thông báo thành công
  console.log("✅ Đã load dữ liệu chi phí lên form:", {
    expenseId: e.expenseId,
    date: normalizeDate(e.date),
    type: e.type,
    category: e.category,
    product: e.product,
    package: e.package,
    amount: e.amount,
    currency: e.currency,
    bank: e.bank,
    card: e.card,
    recurring: e.recurring,
    renewDate: normalizeDate(e.renew),
    supplier: e.supplier,
    status: e.status,
    note: e.note
  });
}