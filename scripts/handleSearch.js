import { getConstants } from './constants.js';

export async function handleSearch(
  userInfo,
  transactionList,
  showProcessingModal,
  showResultModal,
  updateTable,
  formatDate,
  editTransaction,
  deleteTransaction,
  viewTransaction
) {
  if (!userInfo || !userInfo.duocTimKiemGiaoDichCuaAi) {
    showResultModal("Thiếu thông tin quyền tìm kiếm. Vui lòng đăng nhập lại.", false);
    return;
  }

  showProcessingModal("Đang tìm kiếm giao dịch...");
  const { BACKEND_URL } = getConstants();
  const conditions = {};

  const getValue = (id) => document.getElementById(id)?.value?.trim() || "";
  
  // Kiểm tra có phải admin không
  const isAdmin = userInfo.vaiTro && userInfo.vaiTro.toLowerCase() === "admin";
  
  

  const transactionType = getValue("transactionType");
  const transactionDate = isAdmin ? getValue("transactionDate") : "";
  const customerName = getValue("customerName");
  const customerEmail = getValue("customerEmail").toLowerCase();
  const customerPhone = getValue("customerPhone");
  const duration = getValue("duration");
  const startDate = isAdmin ? getValue("startDate") : "";
  const endDate = getValue("endDate");
  const deviceCount = getValue("deviceCount");
  const softwareName = isAdmin ? getValue("softwareName") : "";
  const softwarePackage = isAdmin ? getValue("softwarePackage") : "";
  const accountName = isAdmin ? getValue("accountName") : "";
  
  const revenue = getValue("revenue");
  const note = getValue("note");

  if (transactionType) conditions.transactionType = transactionType;
  if (transactionDate && transactionDate !== "yyyy/mm/dd") conditions.transactionDate = transactionDate;
  if (customerName) conditions.customerName = customerName;
  if (customerEmail) conditions.customerEmail = customerEmail;
  if (customerPhone) conditions.customerPhone = customerPhone;
  if (duration && duration !== "0") conditions.duration = duration;
  if (startDate && startDate !== "yyyy/mm/dd") conditions.startDate = startDate;
  if (endDate && endDate !== "yyyy/mm/dd") conditions.endDate = endDate;
  if (deviceCount && deviceCount !== "0") conditions.deviceCount = deviceCount;
  if (softwareName) conditions.softwareName = softwareName;
  if (softwarePackage) conditions.softwarePackage = softwarePackage;
  if (accountName) conditions.accountName = accountName;
  if (revenue && revenue !== "0") conditions.revenue = revenue;
  if (note) conditions.note = note;

  const data = {
    action: "searchTransactions",
    maNhanVien: userInfo.maNhanVien,
    duocTimKiemGiaoDichCuaAi: userInfo.duocTimKiemGiaoDichCuaAi || "chỉ bản thân",
    conditions: conditions
  };


  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    window.isSearching = true;
    if (result.status === "success") {
      window.transactionList = result.data || [];
      window.transactionList.sort((a, b) => {
        const idA = parseInt((a.transactionId || "").replace("GD", ""));
        const idB = parseInt((b.transactionId || "").replace("GD", ""));
        return idB - idA;
      });

      window.currentPage = 1;
      updateTable(
        window.transactionList,
        window.currentPage,
        window.itemsPerPage,
        formatDate,
        editTransaction,
        deleteTransaction,
        viewTransaction
      );

      showResultModal(`Tìm kiếm thành công! Tìm thấy ${result.data.length} giao dịch.`, true);
    } else {
      showResultModal(result.message || "Không thể tìm kiếm giao dịch!", false);
    }
  } catch (err) {
    showResultModal(`Lỗi khi tìm kiếm giao dịch: ${err.message}`, false);
  }
}
