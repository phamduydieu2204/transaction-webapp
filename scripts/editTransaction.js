import { showProcessingModal, closeProcessingModal } from './modalUnified.js';
import { updateState } from './core/stateManager.js';
import { updateTransactionTypeForEdit } from './transactionTypeManager.js';


export async function editTransaction(index, transactionList, fetchSoftwareList, updatePackageList, updateAccountList) {
  // Kiểm tra index hợp lệ và lấy giao dịch tương ứng
  if (!transactionList || !Array.isArray(transactionList) || index < 0 || index >= transactionList.length) {
    console.error("Danh sách giao dịch không hợp lệ hoặc chỉ số không hợp lệ:", { index, transactionList });
    return;
  }
  const transaction = transactionList[index];
  if (!transaction) {
    console.error("Giao dịch không tồn tại tại chỉ số:", index);
    return;
  }

  // Lưu ID giao dịch hiện tại đang sửa
  window.currentEditTransactionId = transaction.transactionId;
  // Cập nhật state để đồng bộ
  updateState({ currentEditTransactionId: transaction.transactionId });

  // Lấy các phần tử dropdown và input từ DOM
  const softwareNameSelect = document.getElementById("softwareName");
  const softwarePackageSelect = document.getElementById("softwarePackage");
  const accountNameSelect = document.getElementById("accountName");
  const transactionTypeSelect = document.getElementById("transactionType");

  // Lấy giá trị hiện tại của các trường (hoặc chuỗi rỗng nếu null/undefined)
  const softwareNameValue = transaction.softwareName || "";
  const softwarePackageValue = transaction.softwarePackage || "";
  const accountNameValue = transaction.accountName || "";
  const transactionTypeValue = transaction.transactionType || "";

  // Thiết lập các biến toàn cục tạm để giữ giá trị dropdown hiện tại
  window.currentSoftwareName = softwareNameValue;
  window.currentSoftwarePackage = softwarePackageValue;
  window.currentAccountName = accountNameValue;

  // Điền dữ liệu cho các trường văn bản
  document.getElementById("transactionDate").value = transaction.transactionDate;
  document.getElementById("customerName").value = transaction.customerName;
  document.getElementById("customerEmail").value = transaction.customerEmail;
  document.getElementById("customerPhone").value = transaction.customerPhone;
  document.getElementById("duration").value = transaction.duration;
  document.getElementById("startDate").value = transaction.startDate;
  document.getElementById("endDate").value = transaction.endDate;
  document.getElementById("deviceCount").value = transaction.deviceCount;
  document.getElementById("revenue").value = transaction.revenue;
  document.getElementById("note").value = transaction.note;

console.log("📥 editTransaction - gọi fetchSoftwareList với:", {
  softwareNameValue,
  softwarePackageValue,
  accountNameValue
});
console.log("🔎 typeof fetchSoftwareList =", typeof fetchSoftwareList);
  // Đã loại bỏ showProcessingModal để tránh trùng lặp với uiBlocker

  // ✅ Cập nhật danh sách dropdown với các giá trị gốc cần giữ lại
  await fetchSoftwareList(
    softwareNameValue,
    window.softwareData,
    updatePackageList,
    updateAccountList,
    softwarePackageValue,
    accountNameValue
  );
  
    // Đã loại bỏ closeProcessingModal để tránh trùng lặp với uiBlocker

  // Setup transaction type dropdown for edit mode
  updateTransactionTypeForEdit(transactionTypeValue, transactionTypeValue);
  
  // Thêm cảnh báo cho các thay đổi trạng thái quan trọng
  if (transactionTypeSelect) {
    transactionTypeSelect.addEventListener("change", function() {
      const newValue = this.value;
      const originalValue = transaction.transactionType;
      
      // Cảnh báo khi chuyển sang Hoàn tiền
      if (originalValue !== "Hoàn tiền" && newValue === "Hoàn tiền") {
        alert("⚠️ Lưu ý: Khi chuyển sang 'Hoàn tiền':\n\n" +
              "1. Hệ thống sẽ tự động tạo giao dịch hoàn tiền MỚI\n" +
              "2. Giao dịch gốc vẫn giữ trạng thái ban đầu với doanh thu gốc\n" +
              "3. Nhập số tiền hoàn lại vào ô Doanh thu (VD: hoàn 11 VNĐ thì nhập 11)\n" +
              "4. Hệ thống sẽ tự động chuyển thành số âm (-11)\n\n" +
              "💡 Ví dụ: Giao dịch gốc 1122 VNĐ, hoàn lại 11 VNĐ:\n" +
              "- Giao dịch gốc: +1122 VNĐ\n" +
              "- Giao dịch hoàn tiền: -11 VNĐ\n" +
              "- Tổng thực thu: 1111 VNĐ");
      }
      
      // Cảnh báo khi chuyển sang Hủy giao dịch
      if (originalValue !== "Hủy giao dịch" && newValue === "Hủy giao dịch") {
        alert("⚠️ Lưu ý: Khi chuyển sang 'Hủy giao dịch':\n\n" +
              "1. Giao dịch sẽ được đánh dấu là đã hủy\n" +
              "2. Doanh thu sẽ được đặt về 0\n" +
              "3. Quyền truy cập file sẽ bị thu hồi\n" +
              "4. Không thể hoàn tác sau khi lưu\n\n" +
              "💡 Hãy chắc chắn trước khi thực hiện thao tác này!");
      }
    });
  }

  // Gắn sự kiện 'change' cho dropdown tài khoản để cập nhật biến toàn cục tương ứng
  accountNameSelect.addEventListener('change', () => {
    window.currentAccountName = accountNameSelect.value;
  });
}
