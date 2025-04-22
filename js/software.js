import { callProxyAPI } from './utils.js';
import { getCurrentUser } from './auth.js';

export async function initSoftwareList() {
  const res = await callProxyAPI({
    action: "getSoftwareList",
    maNhanVien: getCurrentUser().maNhanVien
  });
  console.log("Danh sách phần mềm:", res.data);
}