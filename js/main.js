import { initAdd } from './add.js';
import { initDelete } from './delete.js';
import { initEdit } from './edit.js';
import { initSearch } from './search.js';
import { initList } from './list.js';
import { initSoftwareList } from './software.js';
import { getCurrentUser } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const welcomeEl = document.getElementById('welcome');
  if (welcomeEl) {
    welcomeEl.textContent = `Xin chào ${user.tenNhanVien} (${user.maNhanVien}) - ${user.vaiTro}`;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('employeeInfo');
      window.location.href = 'index.html';
    });
  }

  initAdd();
  initEdit();
  initDelete();
  initSearch();
  initList();
  initSoftwareList();
});