import { updatePackageList } from './updatePackageList.js';
import { updateAccountList } from './updateAccountList.js';

export async function handleReset(fetchSoftwareList, showProcessingModal, showResultModal, todayFormatted, updatePackageList, updateAccountList) {
  showProcessingModal("Đang làm mới dữ liệu...");
  const startDateInput = document.getElementById("startDate");
  const transactionDateInput = document.getElementById("transactionDate");
  const form = document.getElementById("transactionForm");

  startDateInput.value = todayFormatted;
  transactionDateInput.value = todayFormatted;

  // Tạm thời vô hiệu hóa sự kiện onreset để tránh vòng lặp
  const originalOnReset = form.onreset;
  form.onreset = null;

  document.getElementById("transactionForm").reset();

  // Khôi phục sự kiện onreset
  form.onreset = originalOnReset;

  const softwareNameSelect = document.getElementById("softwareName");
  const softwarePackageSelect = document.getElementById("softwarePackage");
  const accountNameSelect = document.getElementById("accountName");

  softwareNameSelect.removeEventListener("focus", softwareNameSelect.focusHandler);
  softwarePackageSelect.removeEventListener("focus", softwarePackageSelect.focusHandler);
  accountNameSelect.removeEventListener("focus", accountNameSelect.focusHandler);

  document.getElementById("softwareName").value = "";
  document.getElementById("softwarePackage").value = "";
  document.getElementById("accountName").value = "";

  document.getElementById("customerName").value = "";
  document.getElementById("customerEmail").value = "";
  document.getElementById("customerPhone").value = "";
  document.getElementById("duration").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("deviceCount").value = "";
  document.getElementById("note").value = "";
  document.getElementById("revenue").value = "";

  window.currentEditIndex = -1;
  window.currentEditTransactionId = null;

  try {
    await fetchSoftwareList(null, window.softwareData, updatePackageList, updateAccountList);
    showResultModal("Dữ liệu đã được làm mới!", true);
  } catch (err) {
    showResultModal(`Lỗi khi làm mới dữ liệu: ${err.message}`, false);
  }
}