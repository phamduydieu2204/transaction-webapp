import { callProxyAPI } from './utils.js';

export function initDelete() {
  document.body.addEventListener("click", async (e) => {
    if (e.target.matches(".delete-btn")) {
      const id = e.target.dataset.id;
      const res = await callProxyAPI({ action: "deleteTransaction", id });
      alert(res.message || (res.status === "success" ? "Đã xoá!" : "Lỗi xoá!"));
    }
  });
}