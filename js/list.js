import { updateTable } from './pagination.js';

let transactionList = [];

export async function loadTransactions() {
  const userInfo = JSON.parse(localStorage.getItem('employeeInfo'));
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Dữ liệu trả về từ backend:", result);

    if (result.status === "success") {
      transactionList = result.data;
      transactionList.sort((a, b) => {
        const idA = parseInt(a.transactionId.replace("GD", ""));
        const idB = parseInt(b.transactionId.replace("GD", ""));
        return idB - idA;
      });
      updateTable(transactionList);
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

export function getTransactionList() {
  return transactionList;
}