import { getConstants } from './constants.js';
import { cacheManager } from './core/cacheManager.js';

/**
 * Xóa phần mềm và cập nhật giao dịch liên quan
 * @param {Object} software - Object phần mềm cần xóa
 * @param {Function} reloadCallback - Callback để reload danh sách sau khi xóa
 */
export async function handleDeleteSoftware(software, reloadCallback) {
  if (!software) {
    alert("❌ Không tìm thấy thông tin phần mềm để xóa.");
    return;
  }

  // Confirm deletion
  const confirmMessage = `❗ Bạn có chắc chắn muốn xóa phần mềm này?\n\n` +
    `Tên phần mềm: ${software.softwareName}\n` +
    `Gói phần mềm: ${software.softwarePackage}\n` +
    `Tên tài khoản: ${software.accountName}\n\n` +
    `⚠️ Lưu ý: Các giao dịch có ngày kết thúc trong tương lai sẽ được cập nhật tên tài khoản thành "Chưa có nhóm".`;

  if (!confirm(confirmMessage)) return;

  const { BACKEND_URL } = getConstants();
  
  try {
    // console.log('🗑️ Bắt đầu xóa phần mềm:', software);
    
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "handleDeleteSoftware",
        softwareName: software.softwareName,
        softwarePackage: software.softwarePackage,
        accountName: software.accountName,
        maNhanVien: window.userInfo?.maNhanVien || ""
      })
    });

    const result = await response.json();
    
    if (result.status === "success") {
      alert(`✅ ${result.message}`);
      
      // Clear related caches
      if (cacheManager) {
        cacheManager.clearSoftwareCaches?.();
        cacheManager.clearTransactionCaches?.();
      }
      
      // Reload software data
      if (typeof reloadCallback === 'function') {
        await reloadCallback();
      } else if (typeof window.loadSoftwareData === 'function') {
        await window.loadSoftwareData();
      }
      
      // console.log('✅ Đã xóa phần mềm thành công:', result.data);
      
    } else {
      alert("❌ Không thể xóa phần mềm: " + result.message);
      console.error('❌ Lỗi khi xóa phần mềm:', result.message);
    }
    
  } catch (error) {
    alert("❌ Lỗi khi xóa phần mềm: " + error.message);
    console.error('❌ Lỗi khi xóa phần mềm:', error);
  }
}