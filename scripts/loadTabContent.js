// loadTabContent.js - Quản lý load nội dung các tab từ file riêng (Cải thiện)

/**
 * Load nội dung các tab từ file HTML riêng biệt
 */
export async function loadTabContent() {
  const tabContainer = document.getElementById('tab-content-container');
  
  if (!tabContainer) {
    console.error('❌ Không tìm thấy tab-content-container');
    return;
  }

  try {
    console.log('🔄 Bắt đầu load nội dung các tab...');
    
    // ✅ Load từng tab riêng lẻ để dễ debug
    const tabResults = await loadIndividualTabs();
    
    // ✅ Xử lý và clean content trước khi insert
    const cleanedContent = processTabContent(tabResults);
    
    // ✅ Insert content một cách an toàn
    insertTabContent(tabContainer, cleanedContent);
    
    console.log('✅ Đã load thành công tất cả tab content');
    
    // Trigger event để thông báo các tab đã load xong
    document.dispatchEvent(new CustomEvent('tabsLoaded'));
    
  } catch (error) {
    console.error('❌ Lỗi khi load tab content:', error);
    
    // Fallback: sử dụng nội dung mặc định nếu không load được file riêng
    tabContainer.innerHTML = getFallbackContent();
    console.log('🔄 Đã sử dụng fallback content');
  }
}

/**
 * Load từng tab riêng lẻ để dễ debug
 */
async function loadIndividualTabs() {
  const tabConfigs = [
    { name: 'giao-dich', file: 'tab-giao-dich.html' },
    { name: 'chi-phi', file: 'tab-chi-phi.html' },
    { name: 'thong-ke', file: 'tab-thong-ke.html' }
  ];
  
  const results = {};
  
  for (const config of tabConfigs) {
    try {
      console.log(`📂 Loading ${config.name}...`);
      
      const response = await fetch(config.file);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      
      // ✅ Validate content
      if (!content || content.trim().length === 0) {
        throw new Error(`File ${config.file} trống`);
      }
      
      results[config.name] = {
        content: content,
        file: config.file,
        loaded: true
      };
      
      console.log(`✅ Loaded ${config.name}: ${content.length} chars`);
      
    } catch (error) {
      console.error(`❌ Lỗi load ${config.name}:`, error);
      
      results[config.name] = {
        content: getFallbackTabContent(config.name),
        file: config.file,
        loaded: false,
        error: error.message
      };
    }
  }
  
  return results;
}

/**
 * Xử lý và clean nội dung tab
 */
function processTabContent(tabResults) {
  const processedContent = {};
  
  for (const [tabName, result] of Object.entries(tabResults)) {
    let content = result.content;
    
    // ✅ Loại bỏ CSS inline nếu có (nguyên nhân gây lỗi)
    content = removeCSSBlocks(content);
    
    // ✅ Clean up whitespace
    content = content.trim();
    
    // ✅ Validate HTML structure
    if (!isValidTabContent(content, tabName)) {
      console.warn(`⚠️ Tab ${tabName} có cấu trúc không hợp lệ`);
      content = getFallbackTabContent(tabName);
    }
    
    processedContent[tabName] = content;
  }
  
  return processedContent;
}

/**
 * Loại bỏ CSS blocks khỏi HTML để tránh render như text
 */
function removeCSSBlocks(htmlContent) {
  // ✅ Loại bỏ tất cả <style> tags và nội dung bên trong
  const withoutStyle = htmlContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // ✅ Loại bỏ CSS orphan (CSS không trong style tag)
  const withoutOrphanCSS = withoutStyle.replace(/^\s*[.#][a-zA-Z-][^{]*\{[^}]*\}/gm, '');
  
  return withoutOrphanCSS;
}

/**
 * Kiểm tra tính hợp lệ của nội dung tab
 */
function isValidTabContent(content, tabName) {
  // Kiểm tra có div với ID tương ứng không
  const expectedId = `tab-${tabName.replace('-', '-')}`;
  const regex = new RegExp(`<div[^>]+id=["']${expectedId}["']`, 'i');
  
  return regex.test(content);
}

/**
 * Insert content một cách an toàn
 */
function insertTabContent(container, processedContent) {
  // ✅ Clear container trước
  container.innerHTML = '';
  
  // ✅ Create document fragment để tránh multiple reflow
  const fragment = document.createDocumentFragment();
  
  // ✅ Insert từng tab
  Object.values(processedContent).forEach(content => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Move all child nodes to fragment
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
  });
  
  // ✅ Single DOM update
  container.appendChild(fragment);
}

/**
 * Fallback content cho từng tab riêng
 */
function getFallbackTabContent(tabName) {
  switch (tabName) {
    case 'giao-dich':
      return `
        <div id="tab-giao-dich" class="tab-content active">
          <form id="transactionForm" class="form-grid fixed-header" onreset="handleReset()">
            <div>
              <label>Ngày giao dịch:</label>
              <div class="date-input-container">
                <input type="text" id="transactionDate" placeholder="yyyy/mm/dd">
                <i class="fas fa-calendar-alt calendar-icon" onclick="openCalendar('transactionDate')"></i>
              </div>
            </div>
            <div>
              <label>Loại giao dịch:</label>
              <select id="transactionType" required>
                <option value="">-- Chọn loại --</option>
                <option value="Bán hàng">Bán hàng</option>
                <option value="Hoàn Tiền">Hoàn Tiền</option>
                <option value="Dùng thử">Dùng thử</option>
                <option value="Nhập hàng">Nhập hàng</option>
              </select>
            </div>
            <div>
              <label>Email:</label>
              <input type="email" id="customerEmail">
            </div>
            <div>
              <label>Tên khách hàng:</label>
              <div class="search-icon-container">
                <input type="text" id="customerName">
                <i class="fas fa-search search-icon" onclick="updateCustomerInfo()"></i>
              </div>
            </div>
            <div>
              <label>Liên hệ:</label>
              <input type="text" id="customerPhone">
            </div>
            <div>
              <label>Số tháng đăng ký:</label>
              <input type="number" id="duration">
            </div>
            <div>
              <label>Ngày bắt đầu:</label>
              <div class="date-input-container">
                <input type="text" id="startDate" placeholder="yyyy/mm/dd">
                <i class="fas fa-calendar-alt calendar-icon" onclick="openCalendar('startDate')"></i>
              </div>
            </div>
            <div>
              <label>Ngày kết thúc:</label>
              <div class="date-input-container">
                <input type="text" id="endDate" placeholder="yyyy/mm/dd">
                <i class="fas fa-calendar-alt calendar-icon" onclick="openCalendar('endDate')"></i>
              </div>
            </div>
            <div>
              <label>Số thiết bị:</label>
              <input type="number" id="deviceCount">
            </div>
            <div>
              <label>Ghi chú:</label>
              <textarea id="note" rows="2"></textarea>
            </div>
            <div>
              <label>Tên phần mềm:</label>
              <select id="softwareName">
                <option value="">-- Chọn phần mềm --</option>
              </select>
            </div>
            <div>
              <label>Gói phần mềm:</label>
              <select id="softwarePackage">
                <option value="">-- Chọn gói --</option>
              </select>
            </div>
            <div>
              <label>Tên tài khoản:</label>
              <select id="accountName">
                <option value="">-- Chọn tài khoản --</option>
              </select>
            </div>
            <div>
              <label>Doanh thu:</label>
              <input type="number" id="revenue">
            </div>
            <div class="button-row">
              <button type="button" onclick="handleAdd()">Thêm</button>
              <button type="button" onclick="handleUpdate()">Cập nhật</button>
              <button type="button" onclick="handleSearch()">Tìm kiếm</button>
              <button type="reset">Làm mới</button>
            </div>
          </form>
        </div>
      `;
      
    case 'chi-phi':
      return `
        <div id="tab-chi-phi" class="tab-content">
          <h3>Tab Chi Phí</h3>
          <p>Đang tải nội dung...</p>
        </div>
      `;
      
    case 'thong-ke':
      return `
        <div id="tab-thong-ke" class="tab-content">
          <h3>Tab Thống Kê</h3>
          <p>Đang tải nội dung...</p>
        </div>
      `;
      
    default:
      return `<div id="tab-${tabName}" class="tab-content"><p>Tab ${tabName} không khả dụng</p></div>`;
  }
}

/**
 * Nội dung dự phòng tổng thể nếu không load được file riêng
 */
function getFallbackContent() {
  return getFallbackTabContent('giao-dich') + 
         getFallbackTabContent('chi-phi') + 
         getFallbackTabContent('thong-ke');
}

/**
 * Kiểm tra xem các tab đã được load chưa
 */
export function areTabsLoaded() {
  const tabs = ['tab-giao-dich', 'tab-chi-phi', 'tab-thong-ke'];
  return tabs.every(tabId => {
    const element = document.getElementById(tabId);
    return element !== null && element.innerHTML.trim().length > 0;
  });
}

/**
 * Chờ cho đến khi các tab được load xong
 */
export function waitForTabsLoaded() {
  return new Promise((resolve) => {
    if (areTabsLoaded()) {
      resolve();
      return;
    }
    
    document.addEventListener('tabsLoaded', resolve, { once: true });
    
    // Timeout sau 10 giây (tăng từ 5 giây)
    setTimeout(() => {
      console.warn('⚠️ Tab loading timeout - proceeding anyway');
      resolve();
    }, 10000);
  });
}

/**
 * Debug helper - log trạng thái loading
 */
export function debugTabLoading() {
  console.log('🔍 Tab Loading Debug:');
  
  const tabs = ['tab-giao-dich', 'tab-chi-phi', 'tab-thong-ke'];
  
  tabs.forEach(tabId => {
    const element = document.getElementById(tabId);
    console.log(`  ${tabId}:`, {
      exists: !!element,
      hasContent: element ? element.innerHTML.length > 0 : false,
      contentPreview: element ? element.innerHTML.substring(0, 100) + '...' : 'N/A'
    });
  });
}