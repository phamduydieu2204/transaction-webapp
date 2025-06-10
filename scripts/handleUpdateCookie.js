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

// Helper function to parse and analyze cookie format
function parseCookieData(cookieString) {
  console.log('🍪 Parsing cookie data...');
  
  let cookieData = {
    format: 'unknown',
    cookies: [],
    isValid: false,
    keyInfo: {}
  };
  
  // Try to parse as JSON first (Edit This Cookie format)
  try {
    const jsonCookies = JSON.parse(cookieString.trim());
    if (Array.isArray(jsonCookies) && jsonCookies.length > 0) {
      cookieData.format = 'json';
      cookieData.cookies = jsonCookies;
      cookieData.isValid = true;
      
      // Analyze key cookies for Helium10
      cookieData.keyInfo = analyzeCookiesForSite(jsonCookies);
      
      console.log('✅ Parsed as JSON format:', cookieData);
      return cookieData;
    }
  } catch (e) {
    console.log('Not JSON format, trying string format...');
  }
  
  // Try to parse as cookie string format
  if (cookieString.includes('=')) {
    cookieData.format = 'string';
    cookieData.isValid = true;
    
    // Convert string to array format
    const pairs = cookieString.split(';').map(pair => {
      const [name, value] = pair.trim().split('=');
      return { name: name?.trim(), value: value?.trim() };
    }).filter(cookie => cookie.name && cookie.value);
    
    cookieData.cookies = pairs;
    console.log('✅ Parsed as string format:', cookieData);
    return cookieData;
  }
  
  console.log('❌ Unknown cookie format');
  return cookieData;
}

// Analyze cookies for specific sites
function analyzeCookiesForSite(cookies) {
  const analysis = {
    authCookies: [],
    sessionCookies: [],
    importantCookies: [],
    totalCount: cookies.length
  };
  
  cookies.forEach(cookie => {
    const name = cookie.name?.toLowerCase() || '';
    
    // Authentication related cookies
    if (name.includes('identity') || name.includes('auth') || name.includes('session') || name === 'sid') {
      analysis.authCookies.push(cookie);
    }
    
    // Session related cookies  
    if (name.includes('session') || name === 'sid' || name.includes('csrf')) {
      analysis.sessionCookies.push(cookie);
    }
    
    // Important cookies for Helium10
    if (['_identity', 'sid', '_csrf', 'dsik'].includes(name)) {
      analysis.importantCookies.push(cookie);
    }
  });
  
  return analysis;
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
  resultsContent.innerHTML = "🔄 Đang phân tích cookie...";
  
  // Parse cookie data first
  const cookieData = parseCookieData(cookie);
  
  if (!cookieData.isValid) {
    resultsDiv.className = "test-results error";
    resultsContent.innerHTML = `
      ❌ <strong>Cookie không hợp lệ</strong><br>
      Định dạng không được nhận diện. Vui lòng sử dụng:<br>
      • JSON Array từ Edit This Cookie<br>
      • Hoặc string format: name=value; name2=value2
    `;
    return;
  }
  
  // Show initial analysis
  resultsContent.innerHTML = `
    🔄 Đang kiểm tra cookie...<br>
    📊 Định dạng: ${cookieData.format.toUpperCase()}<br>
    📈 Tổng số cookies: ${cookieData.cookies.length}<br>
    ${cookieData.keyInfo.authCookies?.length > 0 ? `🔐 Auth cookies: ${cookieData.keyInfo.authCookies.length}<br>` : ''}
  `;
  
  try {
    // Check if backend supports testCookie action
    const { BACKEND_URL } = getConstants();
    
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "testCookie",
        website: targetWebsite,
        cookieData: cookieData,
        originalCookie: cookie
      })
    });
    
    const result = await response.json();
    console.log('🧪 Test result:', result);
    
    // Check if backend doesn't support testCookie yet
    if (result.message && result.message.includes("không hợp lệ")) {
      // Mock response for demonstration
      const mockSuccess = cookieData.keyInfo.importantCookies?.length > 0;
      
      if (mockSuccess) {
        resultsDiv.className = "test-results success";
        resultsContent.innerHTML = `
          ✅ <strong>Cookie phân tích thành công!</strong><br>
          🌐 Website: ${targetWebsite}<br>
          📊 Format: ${cookieData.format.toUpperCase()} (${cookieData.cookies.length} cookies)<br>
          🔐 Trạng thái: Đã tìm thấy auth cookies<br>
          🔑 Key cookies: ${cookieData.keyInfo.importantCookies.map(c => c.name).join(', ')}<br>
          <br>
          <em>💡 Chức năng test thực tế đang được phát triển. Hiện tại chỉ phân tích cấu trúc cookie.</em>
        `;
      } else {
        resultsDiv.className = "test-results error";
        resultsContent.innerHTML = `
          ⚠️ <strong>Cookie thiếu thông tin quan trọng</strong><br>
          🌐 Website: ${targetWebsite}<br>
          📊 Format: ${cookieData.format.toUpperCase()} (${cookieData.cookies.length} cookies)<br>
          ❌ Không tìm thấy auth cookies quan trọng<br>
          💡 Gợi ý: Cần có cookies như _identity, sid, _csrf cho Helium10<br>
          <br>
          <em>💡 Chức năng test thực tế đang được phát triển.</em>
        `;
      }
      return;
    }
    
    // Normal backend response
    if (result.status === "success") {
      resultsDiv.className = "test-results success";
      resultsContent.innerHTML = `
        ✅ <strong>Cookie hoạt động tốt!</strong><br>
        🌐 Website: ${targetWebsite}<br>
        📊 Format: ${cookieData.format.toUpperCase()} (${cookieData.cookies.length} cookies)<br>
        🔐 Trạng thái: ${result.loginStatus || "Đã đăng nhập"}<br>
        ${result.userInfo ? `👤 User: ${result.userInfo}<br>` : ''}
        ${result.details ? `📝 Chi tiết: ${result.details}<br>` : ''}
        ${cookieData.keyInfo.importantCookies?.length > 0 ? `🔑 Key cookies: ${cookieData.keyInfo.importantCookies.map(c => c.name).join(', ')}` : ''}
      `;
    } else {
      resultsDiv.className = "test-results error";
      resultsContent.innerHTML = `
        ❌ <strong>Cookie không hoạt động</strong><br>
        🌐 Website: ${targetWebsite}<br>
        📊 Format: ${cookieData.format.toUpperCase()} (${cookieData.cookies.length} cookies)<br>
        ❌ Lỗi: ${result.message || "Không thể đăng nhập"}<br>
        ${result.details ? `📝 Chi tiết: ${result.details}<br>` : ''}
        ${result.suggestions ? `💡 Gợi ý: ${result.suggestions}` : ''}
      `;
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
    resultsDiv.className = "test-results error";
    resultsContent.innerHTML = `
      ❌ <strong>Lỗi khi test cookie</strong><br>
      📊 Đã phân tích: ${cookieData.format.toUpperCase()} format (${cookieData.cookies.length} cookies)<br>
      ❌ Chi tiết lỗi: ${err.message}<br>
      <em>💡 Cookie đã được phân tích thành công, nhưng không thể kết nối với server test.</em>
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
  