import { detailModal } from './detailModalUnified.js';

export function viewExpenseRow(expense) {
  if (!expense) {
    console.error("Không tìm thấy chi phí");
    return;
  }

  // Chuẩn bị dữ liệu cho modal
  const fields = [
    { 
      label: "Mã chi phí", 
      value: expense.expenseId,
      showCopy: true,
      important: true
    },
    { 
      label: "Ngày chi", 
      value: expense.date,
      type: "date"
    },
    { 
      label: "Loại kế toán", 
      value: expense.accountingType 
    },
    { 
      label: "Loại khoản chi", 
      value: expense.type 
    },
    { 
      label: "Danh mục", 
      value: expense.category 
    },
    { 
      label: "Sản phẩm/Dịch vụ", 
      value: expense.product 
    },
    { 
      label: "Gói dịch vụ", 
      value: expense.package 
    },
    { 
      label: "Tài khoản sử dụng", 
      value: expense.account 
    },
    { 
      label: "Số tiền", 
      value: expense.amount,
      type: "currency",
      important: true
    },
    { 
      label: "Tiền tệ", 
      value: expense.currency || "VND" 
    },
    { 
      label: "Ngân hàng/Ví", 
      value: expense.bank 
    },
    { 
      label: "Thông tin thẻ/Tài khoản", 
      value: expense.card || expense.cardInfo,
      showCopy: true
    },
    { 
      label: "Phương thức chi", 
      value: expense.recurring 
    },
    { 
      label: "Phân bổ định kỳ", 
      value: expense.periodicAllocation 
    },
    { 
      label: "Ngày tái tục", 
      value: expense.renewDate,
      type: "date"
    },
    { 
      label: "Người nhận/Nhà cung cấp", 
      value: expense.supplier,
      showCopy: true
    },
    { 
      label: "Nguồn tiền", 
      value: expense.source 
    },
    { 
      label: "Trạng thái", 
      value: expense.status,
      type: "status"
    },
    { 
      label: "Ghi chú", 
      value: expense.note || "" 
    }
  ];

  // Hiển thị modal với dữ liệu
  detailModal.show("Chi tiết chi phí", fields);
}
