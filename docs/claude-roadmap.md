# 📋 Lộ trình Refactoring - Transaction WebApp

## 🎯 Mục tiêu
Chia nhỏ các file lớn (>200 dòng) thành các module nhỏ hơn, dễ quản lý và bảo trì.

## 📊 Tổng quan files cần chia

### 🔴 Ưu tiên cao (>1000 dòng)
1. **reportMenuController.js** (2890 dòng) ⏳
2. **financialDashboard.js** (2354 dòng) ⏳
3. **style.css** (1266 dòng) ✅

### 🟡 Ưu tiên trung bình (500-1000 dòng)
4. **main.js** (880 dòng) ⏳
5. **businessOverviewDashboard.js** (726 dòng) ⏳
6. **cashFlowVsAccrualReport.js** (593 dòng) ⏳
7. **statisticsCore.js** (536 dòng) ⏳
8. **loadTransactions.js** (410 dòng) ⏳
9. **main.html** (370 dòng) ✅
10. **statisticsUIController.js** (316 dòng) ⏳

### 🟢 Ưu tiên thấp (200-500 dòng)
11. **handleAddOrUpdateModal.js** (297 dòng) ⏳
12. **expenseCategoryChart.js** (283 dòng) ⏳
13. **handleSearchExpense.js** (257 dòng) ⏳
14. **editTransaction.js** (255 dòng) ⏳
15. **updateTable.js** (239 dòng) ⏳
16. **handleSearch.js** (229 dòng) ⏳
17. **viewTransaction.js** (225 dòng) ⏳
18. **statisticsRenderer.js** (221 dòng) ⏳
19. **handleAdd.js** (206 dòng) ⏳

## 📝 Chi tiết kế hoạch chia file

### 1. ✅ style.css → CSS Modules
**Trạng thái**: ✅ Hoàn thành

**Cấu trúc mới**:
```
css/
├── main.css (import all modules)
├── core/
│   ├── variables.css ✅
│   ├── reset.css ✅
│   └── typography.css ✅
├── components/
│   ├── buttons.css ✅
│   ├── forms.css ✅
│   ├── modals.css ✅
│   ├── tables.css ✅
│   ├── tabs.css ✅
│   ├── cards.css ✅
│   └── charts.css ✅
├── layout/
│   ├── grid.css ✅
│   └── responsive.css ✅
├── pages/
│   ├── login.css ✅
│   └── dashboard.css ✅
└── utilities/
    └── helpers.css ✅
```

### 2. ✅ main.html → HTML Partials
**Trạng thái**: ✅ Hoàn thành

**Cấu trúc mới**:
```
partials/
├── header/
│   ├── header.html ✅
│   └── tab-navigation.html ✅
├── tabs/
│   ├── transaction-tab.html ✅
│   ├── expense-tab.html ✅
│   ├── statistics-tab.html ✅
│   ├── reports-tab.html ✅
│   ├── settings-tab.html ✅
│   └── report-pages.html ✅
└── modals/
    ├── processing-modal.html ✅
    ├── delete-modal.html ✅
    ├── password-modal.html ✅
    ├── add-update-modal.html ✅
    ├── cookie-modal.html ✅
    └── transaction-detail-modal.html ✅
```

### 3. ⏳ reportMenuController.js → Modules
**Trạng thái**: Chưa bắt đầu

**Kế hoạch**:
- `reportMenuController.js` - Controller chính (< 100 dòng)
- `reports/customerAnalytics.js` - Phân tích khách hàng
- `reports/softwareROI.js` - Phân tích ROI phần mềm
- `reports/revenueExpense.js` - Báo cáo doanh thu/chi phí
- `reports/cashFlow.js` - Báo cáo dòng tiền
- `reports/financialOverview.js` - Tổng quan tài chính
- `reports/businessOverview.js` - Tổng quan kinh doanh
- `reports/utils.js` - Utility functions

### 4. ⏳ financialDashboard.js → Modules
**Trạng thái**: Chưa bắt đầu

**Kế hoạch**:
- `financialDashboard.js` - Controller chính
- `dashboard/chartManager.js` - Quản lý biểu đồ
- `dashboard/dataProcessor.js` - Xử lý dữ liệu
- `dashboard/filterManager.js` - Quản lý bộ lọc
- `dashboard/exportManager.js` - Xuất báo cáo
- `dashboard/uiRenderer.js` - Render UI

### 5. ⏳ main.js → Modules
**Trạng thái**: Chưa bắt đầu

**Kế hoạch**:
- `main.js` - Entry point (< 50 dòng)
- `core/appInitializer.js` - Khởi tạo app
- `core/eventManager.js` - Quản lý events
- `core/stateManager.js` - Quản lý state
- `core/navigationManager.js` - Điều hướng tabs
- `core/authManager.js` - Xác thực

### 6. ⏳ businessOverviewDashboard.js → Modules
**Trạng thái**: Chưa bắt đầu

**Kế hoạch**:
- Tách thành các modules tương tự financialDashboard
- Focus vào từng loại báo cáo riêng

### 7. ⏳ Các file khác
- Áp dụng pattern tương tự cho các file còn lại
- Mỗi file > 200 dòng sẽ được chia thành 2-5 modules

## 🚀 Tiến độ tổng quan

### ✅ Đã hoàn thành
- [x] Tạo cấu trúc thư mục cho CSS modules
- [x] Chia style.css thành 15+ CSS modules  
- [x] Tạo cấu trúc HTML partials
- [x] Chia main.html thành 14 partial files
- [x] Tạo partialLoader.js để load dynamic HTML
- [x] Migrate sang index.html mới

### ⏳ Đang thực hiện
- [ ] Test toàn diện index.html mới
- [ ] Xử lý các vấn đề CSS nếu có

### 📋 Cần làm tiếp
- [ ] Chia reportMenuController.js (2890 dòng)
- [ ] Chia financialDashboard.js (2354 dòng)
- [ ] Chia main.js (880 dòng)
- [ ] Chia businessOverviewDashboard.js (726 dòng)
- [ ] Chia các file còn lại theo thứ tự ưu tiên

## 📌 Ghi chú
- Mỗi module mới phải < 200 dòng
- Sử dụng ES6 modules (import/export)
- Giữ nguyên chức năng, chỉ refactor code
- Test kỹ sau mỗi lần chia file
- Update CLAUDE.md nếu cần

---
*Cập nhật lần cuối: <%= new Date().toLocaleDateString('vi-VN') %>*