import { getConstants } from './constants.js';

export async function initExpenseDropdowns() {
  const { BACKEND_URL } = getConstants();
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getExpenseDropdownOptions" })
    });
    const result = await res.json();
    if (result.status !== "success") return;

    const expenseMap = result.expenseMap;
    const bankMap = result.bankMap;

    // Đổ loại khoản chi
    const categorySelect = document.getElementById("expenseCategory");
    Object.keys(expenseMap).forEach(loai => {
      const opt = document.createElement("option");
      opt.value = loai;
      opt.textContent = loai;
      categorySelect.appendChild(opt);
    });

    // Sự kiện liên tiếp
    window.handleCategoryChange = () => {
      const loai = categorySelect.value;
      const danhMucSelect = document.getElementById("expenseSubCategory");
      const productSelect = document.getElementById("expenseProduct");
      const packageSelect = document.getElementById("expensePackage");

      danhMucSelect.innerHTML = '<option value="">-- Chọn danh mục --</option>';
      productSelect.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';
      packageSelect.innerHTML = '<option value="">-- Chọn gói --</option>';

      if (expenseMap[loai]) {
        Object.keys(expenseMap[loai]).forEach(dm => {
          const opt = document.createElement("option");
          opt.value = dm;
          opt.textContent = dm;
          danhMucSelect.appendChild(opt);
        });
      }
    };

    window.handleSubCategoryChange = () => {
      const loai = categorySelect.value;
      const danhMuc = document.getElementById("expenseSubCategory").value;
      const productSelect = document.getElementById("expenseProduct");
      const packageSelect = document.getElementById("expensePackage");

      productSelect.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';
      packageSelect.innerHTML = '<option value="">-- Chọn gói --</option>';

      if (expenseMap[loai] && expenseMap[loai][danhMuc]) {
        Object.keys(expenseMap[loai][danhMuc]).forEach(sp => {
          const opt = document.createElement("option");
          opt.value = sp;
          opt.textContent = sp;
          productSelect.appendChild(opt);
        });
      }
    };

    window.handleProductChange = () => {
      const loai = categorySelect.value;
      const danhMuc = document.getElementById("expenseSubCategory").value;
      const sp = document.getElementById("expenseProduct").value;
      const packageSelect = document.getElementById("expensePackage");

      packageSelect.innerHTML = '<option value="">-- Chọn gói --</option>';

      const goiList = expenseMap?.[loai]?.[danhMuc]?.[sp] || [];
      goiList.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        packageSelect.appendChild(opt);
      });
    };

    // Ngân hàng - thẻ/tài khoản
    const bankSelect = document.getElementById("expenseBank");
    Object.keys(bankMap).forEach(bank => {
      const opt = document.createElement("option");
      opt.value = bank;
      opt.textContent = bank;
      bankSelect.appendChild(opt);
    });

    window.handleBankChange = () => {
      const bank = bankSelect.value;
      const cardSelect = document.getElementById("expenseCard");
      cardSelect.innerHTML = '<option value="">-- Chọn tài khoản --</option>';

      const accounts = bankMap?.[bank] || [];
      accounts.forEach(acc => {
        const opt = document.createElement("option");
        opt.value = acc;
        opt.textContent = acc;
        cardSelect.appendChild(opt);
      });
    };

  } catch (err) {
    console.error("Lỗi khi khởi tạo dropdown chi phí:", err);
  }
}
