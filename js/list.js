import { callProxyAPI } from './utils.js';
import { getCurrentUser } from './auth.js';

export async function initList() {
  const res = await callProxyAPI({
    action: "getTransactions",
    maNhanVien: getCurrentUser().maNhanVien
  });
  console.log("Danh sách giao dịch:", res.data);
}