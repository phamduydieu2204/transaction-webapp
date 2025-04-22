import { callProxyAPI } from './utils.js';
import { getCurrentUser } from './auth.js';

export function initAdd() {
  const btn = document.querySelector('button[type="button"][onclick="handleAdd()"]');
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const data = {
      action: "addTransaction",
      maNhanVien: getCurrentUser().maNhanVien,
      // thu thập thêm dữ liệu từ form
    };
    const res = await callProxyAPI(data);
    alert(res.message || (res.status === "success" ? "Thêm thành công!" : "Thêm thất bại!"));
  });
}