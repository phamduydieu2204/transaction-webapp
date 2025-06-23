// handleAddChiPhi.js

import { getConstants } from './constants.js';
import { showProcessingModal } from './showProcessingModal.js';
import { showResultModal } from './showResultModal.js';
import { handleReset } from './handleReset.js';

const today = new Date();
const todayFormatted = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

export async function handleAddChiPhi(userInfo) {
  showProcessingModal("Đang thêm chi phí...");
  const { BACKEND_URL } = getConstants();

  if (!userInfo) {
    showResultModal("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.", false);
    return;
  }

  const data = {
    action: "addChiPhi",
    maChiPhi: document.getElementById("maChiPhi").value.trim(),
    ngayChi: document.getElementById("ngayChi").value || todayFormatted,
    loaiChiPhi: document.getElementById("loaiChiPhi").value,
    tenPhanMem: document.getElementById("tenPhanMemChiPhi").value,
    goiPhanMem: document.getElementById("goiPhanMemChiPhi").value,
    tenTaiKhoan: document.getElementById("tenTaiKhoanChiPhi").value,
    moTaChiTiet: document.getElementById("moTaChiTiet").value,
    soTien: parseFloat(document.getElementById("soTien").value) || 0,
    dinhKy: document.getElementById("dinhKy").checked ? "Yes" : "No",
    chuKy: document.getElementById("chuKy").value,
    ngayBatDau: document.getElementById("ngayBatDauChiPhi").value,
    ngayKetThuc: document.getElementById("ngayKetThucChiPhi").value,
    ngayTaiTuc: document.getElementById("ngayTaiTuc").value,
    trangThai: document.getElementById("trangThaiChiPhi").value,
    phuongThucThanhToan: document.getElementById("phuongThucThanhToanChiPhi").value,
    ghiChu: document.getElementById("ghiChuChiPhi").value,
    tenNhanVien: userInfo.tenNhanVien,
    maNhanVien: userInfo.maNhanVien
  };

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)

    const result = await response.json();
    if (result.status === "success") {
      showResultModal("Chi phí đã được lưu!", true);
      document.getElementById("chiPhiForm").reset();
    } else {
      showResultModal(result.message || "Không thể lưu chi phí!", false);
    }
  } catch (err) {
    showResultModal(`Lỗi kết nối server: ${err.message}`, false);
    console.error("Lỗi khi thêm chi phí:", err);
  }
}
