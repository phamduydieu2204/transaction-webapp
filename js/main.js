import { initClient } from './auth/initClient.js';
import { login as loginUser } from './auth/login.js';
import { setupDateLogic } from './form/dateLogic.js';
import { loadCustomerSuggestions } from './form/customerSuggestions.js';
import { testForm } from './form/testForm.js';
import { loadSoftwareOptions } from './software/loadSoftware.js';
import { addTransaction } from './transactions/addTransaction.js';
import { editTransaction } from './transactions/editTransaction.js';
import { deleteTransaction } from './transactions/deleteTransaction.js';
import { searchTransactions } from './transactions/searchTransactions.js';
import { showTab } from './ui/showTab.js';
import { loadTemplate } from './ui/loadTemplate.js';

// Tải các template khi khởi động
async function initTemplates() {
    console.log('Starting to load templates...');
    await loadTemplate('login-page', 'templates/login.html');
    console.log('Loaded login.html');
    await loadTemplate('main-page', 'templates/main.html');
    console.log('Loaded main.html');
    await loadTemplate('input-tab', 'templates/input-tab.html');
    console.log('Loaded input-tab.html');
    await loadTemplate('report-tab', 'templates/report-tab.html');
    console.log('Loaded report-tab.html');
    await loadTemplate('transaction-list-container', 'templates/transaction-list.html');
    console.log('Loaded transaction-list.html');
}

// Gắn các hàm vào window để gọi từ HTML
window.login = () => loginUser(() => {
    setupDateLogic();
    loadCustomerSuggestions();
    loadSoftwareOptions();
});
window.showTab = showTab;
window.testForm = testForm;
window.addTransaction = addTransaction;
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.searchTransactions = searchTransactions;

// Khởi động
initTemplates().then(() => {
    console.log('All templates loaded successfully');
    initClient(() => {
        setupDateLogic();
        loadCustomerSuggestions();
        loadSoftwareOptions();
    });
}).catch(err => {
    console.error('Error initializing templates:', err);
});