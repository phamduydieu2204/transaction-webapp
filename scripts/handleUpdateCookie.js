import { getConstants } from './constants.js';
import { showResultModal } from './showResultModal.js';
import { showProcessingModal } from './showProcessingModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';

export async function handleUpdateCookie(index, transactionList) {
  console.log('🍪 handleUpdateCookie called with:', { index, transactionListLength: transactionList?.length });
  
  const transaction = transactionList?.[index];
  console.log('🍪 Found transaction:', transaction);
  
  if (!transaction) {
    console.error('❌ No transaction found at index:', index);
    return alert("Không tìm thấy giao dịch.");
  }

  const modal = document.getElementById("updateCookieModal");
  console.log('🍪 Modal found:', !!modal);
  const currentCookieEl = document.getElementById("currentCookie");
  const newCookieEl = document.getElementById("newCookie");

  currentCookieEl.value = "";
  newCookieEl.value = "";
  window.currentCookieTransaction = transaction;

  // Lấy cookie hiện tại
  try {
    const { BACKEND_URL } = getConstants();
    showProcessingModal("Đang tải cookie...");
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getCookie",
        accountSheetId: transaction.accountSheetId
      })
    });
    const result = await response.json();
    currentCookieEl.value = result.cookie || "(Không có dữ liệu)";
    closeProcessingModal();
    modal.style.display = "block";
  } catch (err) {
    closeProcessingModal();
    showResultModal("Không thể tải cookie: " + err.message, false);
  }
}

export function copyCurrentCookie() {
  console.log('🍪 copyCurrentCookie called');
  
  const val = document.getElementById("currentCookie").value;
  console.log('🍪 Current cookie value:', val);
  
  if (!val || val === "(Không có dữ liệu)") {
    showResultModal("⚠️ Không có cookie để sao chép!", false);
    return;
  }
  
  navigator.clipboard.writeText(val).then(() => {
    console.log('✅ Cookie copied successfully');
    showResultModal("✅ Đã sao chép cookie thành công!", true);
  }).catch((err) => {
    console.error('❌ Copy failed:', err);
    showResultModal("❌ Không thể sao chép cookie!", false);
  });
}

export function testCurrentCookie() {
  console.log('🧪 testCurrentCookie called');
  
  const val = document.getElementById("currentCookie").value;
  console.log('🧪 Cookie to test:', val);
  
  if (!val || val === "(Không có dữ liệu)") {
    showResultModal("⚠️ Không có cookie để test!", false);
    return;
  }
  
  // Store cookie for testing
  window.currentTestCookie = val;
  
  // Show test modal
  const testModal = document.getElementById("testCookieModal");
  if (testModal) {
    testModal.style.display = "block";
    
    // Reset form
    document.getElementById("testWebsite").value = "";
    document.getElementById("customWebsite").value = "";
    document.getElementById("customWebsiteDiv").style.display = "none";
    document.getElementById("testResults").style.display = "none";
    
    // Add website change handler
    const websiteSelect = document.getElementById("testWebsite");
    websiteSelect.onchange = function() {
      const customDiv = document.getElementById("customWebsiteDiv");
      if (this.value === "custom") {
        customDiv.style.display = "block";
      } else {
        customDiv.style.display = "none";
      }
    };
  } else {
    console.error('❌ Test cookie modal not found');
    showResultModal("❌ Không tìm thấy modal test cookie!", false);
  }
}

export async function confirmUpdateCookie() {
  console.log('🍪 confirmUpdateCookie called');
  
  try {
    disableInteraction();
    const transaction = window.currentCookieTransaction;
    console.log('🍪 Current transaction:', transaction);
    
    const newCookieEl = document.getElementById("newCookie");
    console.log('🍪 New cookie element found:', !!newCookieEl);
    
    const newCookie = newCookieEl?.value.trim();
    console.log('🍪 New cookie value:', newCookie);

    if (!transaction || !transaction.transactionId) {
      console.error('❌ No transaction or transaction ID');
      enableInteraction();
      return;
    }
    
    // Kiểm tra cookie mới có rỗng không
    if (!newCookie) {
      console.log('❌ Empty cookie');
      enableInteraction();
      console.log('🔔 Showing alert for empty cookie');
      alert("⚠️ Vui lòng nhập cookie mới trước khi cập nhật!");
      return; // Không đóng modal, để user sửa
    }
    
    // Kiểm tra cookie có quá ngắn không (có thể là lỗi)
    if (newCookie.length < 10) {
      console.log('❌ Cookie too short');
      enableInteraction();
      console.log('🔔 Showing alert for short cookie');
      alert("⚠️ Cookie có vẻ quá ngắn. Vui lòng kiểm tra lại!");
      return; // Không đóng modal, để user sửa
    }
    
    // Kiểm tra cookie có chứa ký tự đặc biệt cần thiết không
    if (!newCookie.includes('=')) {
      console.log('❌ Cookie invalid format');
      enableInteraction();
      alert("⚠️ Cookie có vẻ không đúng định dạng. Cookie thường chứa dấu '='.");
      return; // Không đóng modal, để user sửa
    }

    console.log('✅ All validations passed, proceeding with update');
    
    const { BACKEND_URL } = getConstants();
    showProcessingModal("Đang cập nhật Cookie...");
    
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateCookie",
        transactionId: transaction.transactionId,
        accountSheetId: transaction.accountSheetId,
        newCookie: newCookie,
        type: "confirm"
      })
    });
    
    const result = await response.json();
    console.log('🍪 Update result:', result);
    
    closeProcessingModal();
    
    if (result.status === "success") {
      showResultModal("✅ Cập nhật cookie thành công!\n\nCookie mới đã được lưu cho giao dịch " + transaction.transactionId, true);
      // Chỉ đóng modal khi thành công
      enableInteraction();
      closeUpdateCookieModal();
    } else {
      showResultModal("❌ " + (result.message || "Không thể cập nhật cookie"), false);
      // Không đóng modal khi thất bại, để user thử lại
      enableInteraction();
    }
    
  } catch (err) {
    console.error('❌ Error in confirmUpdateCookie:', err);
    closeProcessingModal();
    showResultModal("❌ Lỗi khi cập nhật cookie: " + err.message, false);
    // Không đóng modal khi có lỗi, để user thử lại
    enableInteraction();
  }
}

export async function cancelUpdateCookie() {
  console.log('🍪 cancelUpdateCookie called');
  
  try {
    disableInteraction();
    const transaction = window.currentCookieTransaction;
    console.log('🍪 Cancel transaction:', transaction);
    
    if (!transaction?.transactionId) {
      console.log('❌ No transaction to cancel');
      enableInteraction();
      closeUpdateCookieModal();
      return;
    }

    const { BACKEND_URL } = getConstants();
    await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateCookie",
        transactionId: transaction.transactionId,
        type: "cancel"
      })
    });
    console.log('✅ Cancel log sent successfully');
    
  } catch (err) {
    console.warn("❌ Không thể gửi log hủy cập nhật cookie:", err.message);
  } finally {
    enableInteraction();
    closeUpdateCookieModal();
  }
}

export function closeUpdateCookieModal() {
  console.log('🍪 closeUpdateCookieModal called');
  const modal = document.getElementById("updateCookieModal");
  if (modal) {
    modal.style.display = "none";
    console.log('✅ Modal closed');
  } else {
    console.error('❌ Modal not found');
  }
}

export function closeTestCookieModal() {
  console.log('🧪 closeTestCookieModal called');
  const modal = document.getElementById("testCookieModal");
  if (modal) {
    modal.style.display = "none";
    console.log('✅ Test modal closed');
  } else {
    console.error('❌ Test modal not found');
  }
}

export async function runCookieTest() {
  console.log('🧪 runCookieTest called');
  
  const websiteSelect = document.getElementById("testWebsite");
  const customWebsite = document.getElementById("customWebsite");
  const cookie = window.currentTestCookie;
  
  if (!websiteSelect.value) {
    showResultModal("⚠️ Vui lòng chọn website để test!", false);
    return;
  }
  
  let targetWebsite = "";
  if (websiteSelect.value === "custom") {
    if (!customWebsite.value.trim()) {
      showResultModal("⚠️ Vui lòng nhập URL website!", false);
      return;
    }
    targetWebsite = customWebsite.value.trim();
  } else {
    targetWebsite = websiteSelect.value;
  }
  
  console.log('🧪 Testing cookie on:', targetWebsite);
  
  // Show loading
  const resultsDiv = document.getElementById("testResults");
  const resultsContent = document.getElementById("testResultsContent");
  
  resultsDiv.style.display = "block";
  resultsDiv.className = "test-results";
  resultsContent.innerHTML = "🔄 Đang kiểm tra cookie...";
  
  try {
    // Since we can't actually test cookies cross-origin from frontend,
    // we'll simulate the test or send to backend
    const { BACKEND_URL } = getConstants();
    
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "testCookie",
        website: targetWebsite,
        cookie: cookie
      })
    });
    
    const result = await response.json();
    console.log('🧪 Test result:', result);
    
    if (result.status === "success") {
      resultsDiv.className = "test-results success";
      resultsContent.innerHTML = `
        ✅ <strong>Cookie hoạt động tốt!</strong><br>
        Website: ${targetWebsite}<br>
        Status: ${result.loginStatus || "Đã đăng nhập"}<br>
        ${result.details ? `Chi tiết: ${result.details}` : ""}
      `;
    } else {
      resultsDiv.className = "test-results error";
      resultsContent.innerHTML = `
        ❌ <strong>Cookie không hoạt động</strong><br>
        Website: ${targetWebsite}<br>
        Lỗi: ${result.message || "Không thể đăng nhập"}<br>
        ${result.details ? `Chi tiết: ${result.details}` : ""}
      `;
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
    resultsDiv.className = "test-results error";
    resultsContent.innerHTML = `
      ❌ <strong>Lỗi khi test cookie</strong><br>
      Chi tiết: ${err.message}<br>
      <em>Có thể do vấn đề kết nối hoặc website không hỗ trợ test từ xa.</em>
    `;
  }
}

function disableInteraction() {
  console.log('🔒 Disabling interaction');
  const overlay = document.getElementById("formOverlay");
  if (overlay) {
    overlay.style.display = "block";
  } else {
    console.error('❌ formOverlay not found');
  }
}

function enableInteraction() {
  console.log('🔓 Enabling interaction'); 
  const overlay = document.getElementById("formOverlay");
  if (overlay) {
    overlay.style.display = "none";
  } else {
    console.error('❌ formOverlay not found');
  }
}
  