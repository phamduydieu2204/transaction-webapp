import { callProxyAPI } from './utils.js';

export function initSearch() {
  const btn = document.querySelector('button[type="button"][onclick="handleSearch()"]');
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const keyword = document.getElementById("customerName").value;
    const res = await callProxyAPI({ action: "searchTransactions", keyword });
    console.log("Kết quả tìm:", res.data);
  });
}