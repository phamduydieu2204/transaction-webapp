import { getConstants } from './constants.js';

export async function loadTransactions(userInfo, updateTable, formatDate, editTransaction, deleteTransaction, viewTransaction) {
  if (!userInfo) {
    console.error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.");
    return { status: "error", message: "Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại." };
  }

  const { BACKEND_URL } = getConstants();
  const vaiTro = userInfo.vaiTro ? userInfo.vaiTro.toLowerCase() : "";
  const data = {
    action: "getTransactions",
    maNhanVien: userInfo.maNhanVien,
    vaiTro: vaiTro
  };

  console.log("Dữ liệu gửi lên backend:", data);

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Dữ liệu trả về từ backend:", result);

    if (result.status === "success") {
      // Bắt đầu lọc dữ liệu dựa trên quyền
      const storedInfo = JSON.parse(localStorage.getItem('employeeInfo')) || {};
      const allowedTypes = (storedInfo.giaoDichNhinThay || "").split(",").map(type => type.trim().toLowerCase());
      const scope = (storedInfo.nhinThayGiaoDichCuaAi || "").toLowerCase();

      let filteredTransactions = result.data;

      // Lọc theo loại giao dịch nếu có cấu hình
      if (allowedTypes.length > 0 && allowedTypes[0] !== "") {
        filteredTransactions = filteredTransactions.filter(tran =>
          allowedTypes.includes((tran.transactionType || "").toLowerCase())
        );
      }

      // Lọc theo người tạo nếu chỉ được xem bản thân
      if (scope === "chỉ bản thân") {
        filteredTransactions = filteredTransactions.filter(tran =>
          tran.maNhanVien && tran.maNhanVien.toUpperCase() === userInfo.maNhanVien.toUpperCase()
        );
      }

      // Gán vào window.transactionList sau khi lọc
      window.transactionList = filteredTransactions;

      window.transactionList.sort((a, b) => {
        const idA = parseInt(a.transactionId.replace("GD", ""));
        const idB = parseInt(b.transactionId.replace("GD", ""));
        return idB - idA;
      });

      window.currentPage = 1;
      updateTable(window.transactionList, window.currentPage, window.itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction);
      return { status: "success", data: result.data };
    } else {
      document.getElementById("errorMessage").textContent = result.message || "Không thể tải danh sách giao dịch!";
      return { status: "error", message: result.message || "Không thể tải danh sách giao dịch!" };
    }
  } catch (err) {
    document.getElementById("errorMessage").textContent = `Lỗi khi tải danh sách giao dịch: ${err.message}`;
    console.error("Lỗi khi tải danh sách giao dịch", err);
    return { status: "error", message: `Lỗi khi tải danh sách giao dịch: ${err.message}` };
  }
}
