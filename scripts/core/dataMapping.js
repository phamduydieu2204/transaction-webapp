/**
 * Data Mapping Configuration
 * Maps Google Sheets column names to application field names
 */

/**
 * Transaction field mapping based on Google Sheets structure
 * Columns A-V: Mã giao dịch -> Mã nhân viên
 */
export const TRANSACTION_FIELD_MAPPING = {
  // Column A: Mã giao dịch
  transactionId: ['Mã giao dịch', 'maGiaoDich', 'id', 'transactionId'],
  
  // Column B: Ngày giao dịch
  transactionDate: ['Ngày giao dịch', 'ngayGiaoDich', 'date', 'transactionDate'],
  
  // Column C: Loại giao dịch (Đã hoàn tất, Đã thanh toán, Chưa thanh toán, Hoàn tiền)
  transactionType: ['Loại giao dịch', 'loaiGiaoDich', 'status', 'transactionType'],
  
  // Column D: Tên khách hàng
  customerName: ['Tên khách hàng', 'tenKhachHang', 'customer', 'customerName'],
  
  // Column E: Email
  email: ['Email', 'email'],
  
  // Column F: Liên hệ
  contact: ['Liên hệ', 'lienHe', 'contact', 'phone'],
  
  // Column G: Số tháng đăng ký
  subscriptionMonths: ['Số tháng đăng ký', 'soThangDangKy', 'months', 'subscriptionMonths'],
  
  // Column H: Ngày bắt đầu
  startDate: ['Ngày bắt đầu', 'ngayBatDau', 'startDate'],
  
  // Column I: Ngày kết thúc
  endDate: ['Ngày kết thúc', 'ngayKetThuc', 'endDate'],
  
  // Column J: Số thiết bị
  deviceCount: ['Số thiết bị', 'soThietBi', 'devices', 'deviceCount'],
  
  // Column K: Tên phần mềm
  softwareName: ['Tên phần mềm', 'tenPhanMem', 'software', 'product', 'softwareName'],
  
  // Column L: Gói phần mềm
  softwarePackage: ['Gói phần mềm', 'goiPhanMem', 'package', 'softwarePackage'],
  
  // Column M: Tên tài khoản
  accountName: ['Tên tài khoản', 'tenTaiKhoan', 'account', 'accountName'],
  
  // Column N: ID Sheet Tài khoản
  sheetId: ['ID Sheet Tài khoản', 'idSheetTaiKhoan', 'sheetId'],
  
  // Column O: Cập nhật Cookie
  cookieUpdate: ['Cập nhật Cookie', 'capNhatCookie', 'cookieUpdate'],
  
  // Column P: Thông tin đơn hàng
  orderInfo: ['Thông tin đơn hàng', 'thongTinDonHang', 'orderInfo'],
  
  // Column Q: Doanh thu
  revenue: ['Doanh thu', 'doanhThu', 'revenue', 'amount'],
  
  // Column R: Hoa hồng
  commission: ['Hoa hồng', 'hoaHong', 'commission'],
  
  // Column S: Ghi chú
  notes: ['Ghi chú', 'ghiChu', 'notes'],
  
  // Column T: Tên chuẩn
  standardName: ['Tên chuẩn', 'tenChuan', 'standardName'],
  
  // Column U: Tên nhân viên
  employeeName: ['Tên nhân viên', 'tenNhanVien', 'employee', 'employeeName'],
  
  // Column V: Mã nhân viên
  employeeId: ['Mã nhân viên', 'maNhanVien', 'employeeId']
};

/**
 * Get field value from transaction object with fallback support
 * @param {Object} transaction - Transaction object
 * @param {string} fieldName - Field name to retrieve
 * @returns {*} Field value or null
 */
export function getTransactionField(transaction, fieldName) {
  if (!transaction || !fieldName) return null;
  
  const possibleKeys = TRANSACTION_FIELD_MAPPING[fieldName];
  if (!possibleKeys) return null;
  
  // Try each possible key until we find a value
  for (const key of possibleKeys) {
    if (transaction.hasOwnProperty(key) && transaction[key] !== undefined && transaction[key] !== null) {
      return transaction[key];
    }
  }
  
  return null;
}

/**
 * Normalize transaction object to use consistent field names
 * @param {Object} rawTransaction - Raw transaction from API
 * @returns {Object} Normalized transaction object
 */
export function normalizeTransaction(rawTransaction) {
  if (!rawTransaction) return null;
  
  const normalized = {};
  
  // Map each field using the mapping configuration
  for (const [fieldName, possibleKeys] of Object.entries(TRANSACTION_FIELD_MAPPING)) {
    const value = getTransactionField(rawTransaction, fieldName);
    if (value !== null) {
      normalized[fieldName] = value;
    }
  }
  
  // Ensure numeric fields are properly parsed
  if (normalized.revenue) {
    normalized.revenue = parseFloat(normalized.revenue) || 0;
  }
  if (normalized.commission) {
    normalized.commission = parseFloat(normalized.commission) || 0;
  }
  if (normalized.deviceCount) {
    normalized.deviceCount = parseInt(normalized.deviceCount) || 0;
  }
  if (normalized.subscriptionMonths) {
    normalized.subscriptionMonths = parseInt(normalized.subscriptionMonths) || 0;
  }
  
  // Ensure date fields are valid
  if (normalized.transactionDate) {
    normalized.transactionDate = normalizeDate(normalized.transactionDate);
  }
  if (normalized.startDate) {
    normalized.startDate = normalizeDate(normalized.startDate);
  }
  if (normalized.endDate) {
    normalized.endDate = normalizeDate(normalized.endDate);
  }
  
  return normalized;
}

/**
 * Normalize date string to consistent format
 * @param {string|Date} dateValue - Date value to normalize
 * @returns {string} Normalized date string or null
 */
function normalizeDate(dateValue) {
  if (!dateValue) return null;
  
  try {
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (e) {
    console.warn('Invalid date value:', dateValue);
  }
  
  return null;
}

/**
 * Get display name for transaction type
 * @param {string} type - Transaction type value
 * @returns {string} Display name
 */
export function getTransactionTypeDisplay(type) {
  if (!type) return 'Không xác định';
  
  const typeLower = type.toLowerCase();
  
  if (typeLower.includes('hoàn tất') || typeLower.includes('completed')) {
    return 'Đã hoàn tất';
  }
  if (typeLower.includes('đã thanh toán') || typeLower.includes('paid')) {
    return 'Đã thanh toán';
  }
  if (typeLower.includes('chưa thanh toán') || typeLower.includes('unpaid')) {
    return 'Chưa thanh toán';
  }
  if (typeLower.includes('hoàn tiền') || typeLower.includes('refund')) {
    return 'Hoàn tiền';
  }
  
  return type;
}

/**
 * Check if transaction has specific status
 * @param {Object} transaction - Transaction object
 * @param {string} status - Status to check
 * @returns {boolean} True if transaction has the status
 */
export function hasTransactionStatus(transaction, status) {
  const type = getTransactionField(transaction, 'transactionType');
  if (!type) return false;
  
  const typeLower = type.toLowerCase();
  const statusLower = status.toLowerCase();
  
  return typeLower.includes(statusLower);
}