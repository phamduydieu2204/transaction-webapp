import { callProxyAPI } from './utils.js';

export function initEdit() {
  const btn = document.querySelector('button[type="button"][onclick="handleUpdate()"]');
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const data = {
      action: "updateTransaction",
      // thu thập dữ liệu cần cập nhật
    };
    const res = await callProxyAPI(data);
    alert(res.message || (res.status === "success" ? "Cập nhật thành công!" : "Cập nhật thất bại!"));
  });
}