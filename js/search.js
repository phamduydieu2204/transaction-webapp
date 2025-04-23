import { showProcessingModal, showResultModal } from './utils.js';
import { updateTable } from './pagination.js';

let transactionList = [];

export function initSearch(transactions) {
  transactionList = transactions;
}

export async function handleSearch() {
  const userInfo = JSON.parse(localStorage.getItem('employeeInfo'));
  if (!userInfo || !userInfo.vaiTro) {
    showResultModal("Thông tin vai trò không hợp lệ. Vui lòng đăng nhập lại.", false);
    return;
  }

  showProcessingModal("Đang tìm kiếm giao dịch...");
  const { BACKEND_URL } = getConstants();
  const conditions = {};

  const transactionType = document.getElementById("transactionType").value;
  const transactionDate = document.getElementById("transactionDate").value;
  const customerName = document.getElementById("customerName").value;
  const customerEmail = document.getElementById("customerEmail").value.toLowerCase();
  const customerPhone = document.getElementById("customerPhone").value;
  const duration = document.getElementById("duration").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const deviceCount = document.getElementById("deviceCount").value;
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackage = document.getElementById("softwarePackage").value;
  const accountName = document.getElementById("accountName").value;
  const revenue = document.getElementById("revenue").value;
  const note = document.getElementById("note").value;
  const maNhanVien = userInfo.maNhanVien;

  if (transactionType && transactionType !== "") conditions.transactionType = transactionType;
  if (transactionDate && transactionDate !== "yyyy/mm/dd") conditions.transactionDate = transactionDate;
  if (customerName) conditions.customerName = customerName;
  if (customerEmail) conditions.customerEmail = customerEmail;
  if (customerPhone) conditions.customerPhone = customerPhone;
  if (duration && duration !== "0") conditions.duration = duration;
  if (startDate && startDate !== "yyyy/mm/dd") conditions.startDate = startDate;
  if (endDate && endDate !== "yyyy/mm/dd") conditions.endDate = endDate;
  if (deviceCount && deviceCount !== "0") conditions.deviceCount = deviceCount;
  if (softwareName && softwareName !== "") conditions.softwareName = softwareName;
  if (softwarePackage && softwarePackage !== "") conditions.softwarePackage = softwarePackage;
  if (accountName && accountName !== "") conditions.accountName = accountName;
  if (revenue && revenue !== "0") conditions.revenue = revenue;
  if (note) conditions.note = note;
  if (maNhanVien) conditions.maNhanVien = maNhanVien;

  const data = {
    action: "searchTransactions",
    maNhanVien: userInfo.maNhanVien,
    vaiTro: userInfo.vaiTro ? userInfo.vaiTro.toLowerCase() : "",
    conditions
  };

  console.log("📤 Dữ liệu tìm kiếm gửi đi:", JSON.stringify(data, null, 2));

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      transactionList = result.data;
      transactionList.sort((a, b) => {
        const idA = parseInt(a.transactionId.replace("GD", ""));
        const idB = parseInt(b.transactionId.replace("GD", ""));
        return idB - idA;
      });
      currentPage = 1;
      updateTable();
      showResultModal(`Tìm kiếm thành công! Tìm thấy ${result.data.length} giao dịch.`, true);
    } else {
      showResultModal(result.message || "Không thể tìm kiếm giao dịch!", false);
    }
  } catch (err) {
    showResultModal(`Lỗi khi tìm kiếm giao dịch: ${err.message}`, false);
    console.error("Lỗi khi tìm kiếm giao dịch", err);
  }
}