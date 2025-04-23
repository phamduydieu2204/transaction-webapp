import { checkAuth, logout } from './auth.js';
import { initAdd, handleReset } from './add.js';
import { initDelete } from './delete.js';
import { initEdit } from './edit.js';
import { initSearch } from './search.js';
import { loadTransactions, getTransactionList } from './list.js';
import { fetchSoftwareList } from './software.js';
import { initView } from './view.js';

const today = new Date();
const todayFormatted = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

document.addEventListener('DOMContentLoaded', () => {
  const user = checkAuth();
  if (!user) return;

  document.getElementById('welcome').textContent = `Xin chào ${user.tenNhanVien} (${user.maNhanVien}) - ${user.vaiTro}`;

  const startDateInput = document.getElementById('startDate');
  const durationInput = document.getElementById('duration');
  const endDateInput = document.getElementById('endDate');
  const transactionDateInput = document.getElementById('transactionDate');

  startDateInput.value = todayFormatted;
  transactionDateInput.value = todayFormatted;

  function calculateEndDate() {
    const start = new Date(startDateInput.value);
    const months = parseInt(durationInput.value || 0);
    if (!isNaN(months)) {
      const estimated = new Date(start.getTime() + months * 30 * 24 * 60 * 60 * 1000);
      const year = estimated.getFullYear();
      const month = String(estimated.getMonth() + 1).padStart(2, '0');
      const day = String(estimated.getDate()).padStart(2, '0');
      endDateInput.value = `${year}/${month}/${day}`;
    }
  }

  startDateInput.addEventListener('change', calculateEndDate);
  durationInput.addEventListener('input', calculateEndDate);

  document.getElementById('logoutBtn').addEventListener('click', logout);

  fetchSoftwareList(null);
  document.getElementById('softwareName').addEventListener('change', updatePackageList);
  document.getElementById('softwarePackage').addEventListener('change', updateAccountList);

  loadTransactions().then(result => {
    if (result.status === 'success') {
      const transactions = getTransactionList();
      initAdd();
      initDelete(transactions);
      initEdit(transactions);
      initSearch(transactions);
      initView(transactions);
    }
  });
});