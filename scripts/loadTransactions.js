import { getConstants } from './constants.js';

export async function loadTransactions(userInfo, updateTable, formatDate, editTransaction, deleteTransaction, viewTransaction) {
  if (!userInfo) {
    return { status: "error", message: "Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại." };
  }

  const { BACKEND_URL } = getConstants();
  const data = {
    action: "getTransactions",
    maNhanVien: userInfo.maNhanVien,
    vaiTro: userInfo.vaiTro ? userInfo.vaiTro.toLowerCase() : "",
    giaoDichNhinThay: userInfo.giaoDichNhinThay || "",
    nhinThayGiaoDichCuaAi: userInfo.nhinThayGiaoDichCuaAi || ""
  };

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    window.isSearching = false;
    if (result.status === "success") {
      window.transactionList = result.data || [];

      // Sắp xếp giao dịch mới nhất lên đầu (ID lớn hơn trước)
      window.transactionList.sort((a, b) => {
        const idA = parseInt((a.transactionId || "").replace("GD", ""));
        const idB = parseInt((b.transactionId || "").replace("GD", ""));
        return idB - idA;
      });

      window.currentPage = 1;
      updateTable(window.transactionList, window.currentPage, window.itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction);

      return { status: "success", data: window.transactionList };
    } else {
      document.getElementById("errorMessage").textContent = result.message || "Không thể tải danh sách giao dịch!";
      return { status: "error", message: result.message || "Không thể tải danh sách giao dịch!" };
    }
  } catch (err) {
    document.getElementById("errorMessage").textContent = `Lỗi khi tải danh sách giao dịch: ${err.message}`;
    return { status: "error", message: `Lỗi khi tải danh sách giao dịch: ${err.message}` };
  }
}
