// loadTabContent.js - Quản lý load nội dung các tab từ file riêng

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
    
    // Load tất cả các tab song song để tăng tốc độ
    const [giaoResponse, phiResponse, keResponse] = await Promise.all([
      fetch('tab-giao-dich.html'),
      fetch('tab-chi-phi.html'), 
      fetch('tab-thong-ke.html')
    ]);
    
    // Kiểm tra response status
    if (!giaoResponse.ok || !phiResponse.ok || !keResponse.ok) {
      throw new Error('Một hoặc nhiều file tab không tải được');
    }
    
    const giaoContent = await giaoResponse.text();
    const phiContent = await phiResponse.text();
    const keContent = await keResponse.text();
    
    // Thêm tất cả nội dung vào container
    tabContainer.innerHTML = giaoContent + phiContent + keContent;
    
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
 * Nội dung dự phòng nếu không load được file riêng
 */
function getFallbackContent() {
  return `
    <!-- Fallback content -->
    <div id="tab-giao-dich" class="tab-content active">
      <form id="transactionForm" class="form-grid fixed-header" onreset="handleReset()">
        <!-- Dòng 1 -->
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

        <!-- Dòng 2 -->
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

        <!-- Dòng 3 -->
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

        <!-- Dòng 4: Các nút -->
        <div class="button-row">
          <button type="button" onclick="handleAdd()">Thêm</button>
          <button type="button" onclick="handleUpdate()">Cập nhật</button>
          <button type="button" onclick="handleSearch()">Tìm kiếm</button>
          <button type="reset">Làm mới</button>
        </div>
      </form>
    </div>

    <div id="tab-chi-phi" class="tab-content">
      <p>Tab chi phí đang được tải...</p>
    </div>

    <div id="tab-thong-ke" class="tab-content">
      <p>Tab thống kê đang được tải...</p>
    </div>
  `;
}

/**
 * Kiểm tra xem các tab đã được load chưa
 */
export function areTabsLoaded() {
  const tabs = ['tab-giao-dich', 'tab-chi-phi', 'tab-thong-ke'];
  return tabs.every(tabId => document.getElementById(tabId) !== null);
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
    
    // Timeout sau 5 giây
    setTimeout(() => {
      resolve();
    }, 5000);
  });
}