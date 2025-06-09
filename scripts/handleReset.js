import { updatePackageList } from './updatePackageList.js';
import { updateAccountList } from './updateAccountList.js';
import { getTodayFormatted, setDefaultDates } from './calculateEndDate.js';
import { updateState } from './core/stateManager.js';

export async function handleReset(fetchSoftwareList, showProcessingModal, showResultModal, todayFormatted, updatePackageList, updateAccountList) {
  showProcessingModal("Đang làm mới dữ liệu...");
  const form = document.getElementById("transactionForm");
  
  // Use the getTodayFormatted function if todayFormatted is not provided
  const today = todayFormatted || getTodayFormatted();

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

  // Set default dates after reset - force update to today's date
  setDefaultDates(true);

  // Event handlers are already attached, no need to re-initialize

  window.currentEditIndex = -1;
  window.currentEditTransactionId = null;
  // Cập nhật state để đồng bộ
  updateState({ currentEditTransactionId: null });

  try {
    await fetchSoftwareList(null, window.softwareData, updatePackageList, updateAccountList);
    // Don't reload transactions here, it's handled by the caller
    // Removed "Dữ liệu đã được làm mới!" notification as requested
  } catch (err) {
    showResultModal(`Lỗi khi làm mới dữ liệu: ${err.message}`, false);
  }
}