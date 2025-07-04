import { apiRequestJson } from './apiClient.js';

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

  const getValue = (id) => document.getElementById(id)?.value?.trim() || "";
  
  // Kiểm tra có phải admin không
  const isAdmin = userInfo.vaiTro && userInfo.vaiTro.toLowerCase() === "admin";
  
  // Lấy giá trị từ trường ghi chú để kiểm tra tìm kiếm toàn cục
  const note = getValue("note");
  
  // Kiểm tra các trường khác có được nhập không
  const otherFields = [
    getValue("transactionType"),
    isAdmin ? getValue("transactionDate") : "",
    getValue("customerName"),
    getValue("customerEmail"),
    getValue("customerPhone"),
    getValue("duration"),
    isAdmin ? getValue("startDate") : "",
    getValue("endDate"),
    getValue("deviceCount"),
    isAdmin ? getValue("softwareName") : "",
    isAdmin ? getValue("softwarePackage") : "",
    isAdmin ? getValue("accountName") : "",
    getValue("revenue")
  ].filter(val => val && val !== "" && val !== "0" && val !== "yyyy/mm/dd");
  
  // Kiểm tra nếu trường ghi chú có dữ liệu -> Luôn tìm kiếm toàn cục
  const isGlobalSearch = note && note.trim() !== "";
  
  showProcessingModal(isGlobalSearch ? 
    `🌍 Tìm kiếm toàn cục cho: "${note}"...` : 
    "Đang tìm kiếm giao dịch...");
  
  const conditions = {};

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

  if (isGlobalSearch) {
    // Tìm kiếm toàn cục - chỉ gửi text từ trường ghi chú, bỏ qua tất cả trường khác
    conditions.globalSearchText = note;
    console.log("🌍 Tìm kiếm toàn cục với từ khóa:", note);
    // console.log("🚫 Bỏ qua tất cả trường khác khi có dữ liệu trong ghi chú");
  } else {
    // Tìm kiếm thông thường theo từng trường cụ thể
    // console.log("🔍 Tìm kiếm theo trường cụ thể");
    
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
  }

  const data = {
    action: isGlobalSearch ? "globalSearchTransactions" : "searchTransactions",
    maNhanVien: userInfo.maNhanVien,
    duocTimKiemGiaoDichCuaAi: userInfo.duocTimKiemGiaoDichCuaAi || "chỉ bản thân",
    conditions: conditions
  };

  console.log("📤 Tìm kiếm giao dịch với data:", JSON.stringify(data, null, 2));


  try {
    const result = await apiRequestJson(data);
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

      // Thông báo khác nhau tùy theo loại tìm kiếm
      if (isGlobalSearch) {
        showResultModal(`Tìm kiếm toàn cục thành công! Tìm thấy ${result.data.length} giao dịch chứa "${note}".`, true);
      } else {
        showResultModal(`Tìm kiếm thành công! Tìm thấy ${result.data.length} giao dịch.`, true);
      }
    } else {
      showResultModal(result.message || "Không thể tìm kiếm giao dịch!", false);
    }
  } catch (err) {
    showResultModal(`Lỗi khi tìm kiếm giao dịch: ${err.message}`, false);
  }
}
