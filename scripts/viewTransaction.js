// viewTransaction.js

import { detailModal } from './detailModalUnified.js';
import { getConstants } from './constants.js';

export async function viewTransaction(index, transactionList, formatDate) {
  const transaction = transactionList[index];
  
  if (!transaction) {
    console.error("Không tìm thấy giao dịch");
    return;
  }

  // Chuẩn bị dữ liệu cho modal
  const fields = [
    { 
      label: "Mã giao dịch", 
      value: transaction.transactionId, 
      showCopy: true,
      important: true
    },
    { 
      label: "Ngày giao dịch", 
      value: formatDate(transaction.transactionDate),
      type: "date"
    },
    { 
      label: "Loại giao dịch", 
      value: transaction.transactionType 
    },
    { 
      label: "Tên khách hàng", 
      value: transaction.customerName,
      important: true
    },
    { 
      label: "Email", 
      value: transaction.customerEmail, 
      showCopy: true,
      type: "email"
    },
    {
      label: "Số điện thoại",
      value: transaction.customerPhone,
      showCopy: true,
      showExternalLink: true,
      type: "phone"
    },
    { 
      label: "Số tháng đăng ký", 
      value: transaction.duration 
    },
    { 
      label: "Ngày bắt đầu", 
      value: formatDate(transaction.startDate),
      type: "date"
    },
    { 
      label: "Ngày kết thúc", 
      value: formatDate(transaction.endDate),
      type: "date"
    },
    { 
      label: "Số thiết bị", 
      value: transaction.deviceCount 
    },
    { 
      label: "Tên phần mềm", 
      value: transaction.softwareName 
    },
    { 
      label: "Gói phần mềm", 
      value: transaction.softwarePackage 
    },
    { 
      label: "Tên tài khoản", 
      value: transaction.accountName || "" 
    },
    { 
      label: "ID Sheet Tài Khoản", 
      value: transaction.accountSheetId || "",
      showCopy: true,
      type: "link"
    },
    { 
      label: "Thông tin đơn hàng", 
      value: transaction.orderInfo || "", 
      showCopy: true 
    },
    { 
      label: "Doanh thu", 
      value: transaction.revenue,
      type: "currency",
      important: true
    },
    { 
      label: "Ghi chú", 
      value: transaction.note 
    },
    { 
      label: "Tên nhân viên", 
      value: transaction.tenNhanVien 
    },
    { 
      label: "Mã nhân viên", 
      value: transaction.maNhanVien 
    }
  ];

  // Lấy thông tin tài khoản bổ sung
  try {
    const { BACKEND_URL } = getConstants();
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getAccountInfoBySoftware",
        softwareName: transaction.softwareName,
        softwarePackage: transaction.softwarePackage,
        accountName: transaction.accountName
      })      
    });
    const result = await res.json();
    console.log("✅ Kết quả lấy thông tin tài khoản:", result);
    if (result.status === "success") {
      fields.push({ 
        label: "Tên đăng nhập", 
        value: result.username || "", 
        showCopy: true,
        important: true
      });
      fields.push({ 
        label: "Mật khẩu đăng nhập", 
        value: result.password || "", 
        showCopy: true,
        important: true
      });
      fields.push({ 
        label: "Secret", 
        value: result.secret || "", 
        showCopy: true 
      });
    } else {
      console.warn("Không thể lấy thông tin tài khoản:", result.message);
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tài khoản từ PhanMem:", error);
  }

  // Hiển thị modal với dữ liệu
  detailModal.show("Chi tiết giao dịch", fields);
}
