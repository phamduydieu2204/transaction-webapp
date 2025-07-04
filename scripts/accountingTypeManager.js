/**
 * accountingTypeManager.js
 * 
 * Manages accounting type determination and category mappings
 */

import { ACCOUNTING_TYPES } from './constants.js';

// Cache for expense categories from DanhMucChiPhi sheet
let expenseCategoriesCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch expense categories from Google Sheets
 */
async function fetchExpenseCategories() {
  const now = Date.now();
  
  // Return cached data if still fresh
  if (expenseCategoriesCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
    return expenseCategoriesCache;
  }
  
  try {
    // This would be the actual API call to fetch DanhMucChiPhi sheet
    // For now, return mock data structure
    const response = await fetch('YOUR_GOOGLE_SHEETS_API_ENDPOINT/expenseCategories');
    const data = await response.json();
    
    // Cache the data
    expenseCategoriesCache = data;
    lastFetchTime = now;
    
    return data;
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    
    // Return default mappings if API fails
    return getDefaultCategoryMappings();
  }
}

/**
 * Get default category mappings (fallback)
 */
function getDefaultCategoryMappings() {
  return [
    // COGS mappings
    { 
      loaiKeToan: ACCOUNTING_TYPES.COGS,
      loaiKhoanChi: 'Kinh doanh phần mềm',
      danhMucChung: 'Chi phí phần mềm'
    },
    { 
      loaiKeToan: ACCOUNTING_TYPES.COGS,
      loaiKhoanChi: 'Kinh doanh Amazon',
      danhMucChung: 'Chi phí hàng hóa'
    },
    { 
      loaiKeToan: ACCOUNTING_TYPES.COGS,
      loaiKhoanChi: 'Kinh doanh phần mềm',
      danhMucChung: 'Mua license'
    },
    
    // OPEX mappings
    { 
      loaiKeToan: ACCOUNTING_TYPES.OPEX,
      loaiKhoanChi: 'Kinh doanh phần mềm',
      danhMucChung: 'Marketing'
    },
    { 
      loaiKeToan: ACCOUNTING_TYPES.OPEX,
      loaiKhoanChi: 'Kinh doanh phần mềm',
      danhMucChung: 'Quảng cáo'
    },
    { 
      loaiKeToan: ACCOUNTING_TYPES.OPEX,
      loaiKhoanChi: 'Vận hành',
      danhMucChung: null
    },
    { 
      loaiKeToan: ACCOUNTING_TYPES.OPEX,
      loaiKhoanChi: 'Chi phí văn phòng',
      danhMucChung: null
    },
    
    // Non-related mappings
    { 
      loaiKeToan: ACCOUNTING_TYPES.NON_RELATED,
      loaiKhoanChi: 'Sinh hoạt cá nhân',
      danhMucChung: null
    },
    { 
      loaiKeToan: ACCOUNTING_TYPES.NON_RELATED,
      loaiKhoanChi: 'Chi phí cá nhân',
      danhMucChung: null
    }
  ];
}

/**
 * Determine accounting type based on expense details
 * @param {Object} expenseData - Expense data object
 * @returns {string} Accounting type (COGS, OPEX, or Không liên quan)
 */
export async function determineAccountingType(expenseData) {
  const {
    expenseCategory,    // Loại khoản chi
    expenseSubCategory, // Danh mục chung
    expenseProduct,     // Tên sản phẩm/Dịch vụ
    expensePackage,     // Phiên bản/Gói dịch vụ
    expenseAccount      // Tài khoản sử dụng (if needed)
  } = expenseData;
  
  // Get category mappings
  const categories = await fetchExpenseCategories();
  
  // Find exact match first
  const exactMatch = categories.find(cat => 
    cat.loaiKhoanChi === expenseCategory &&
    cat.danhMucChung === expenseSubCategory &&
    (!cat.tenSanPham || cat.tenSanPham === expenseProduct) &&
    (!cat.phienBan || cat.phienBan === expensePackage)
  );
  
  if (exactMatch) {
    return exactMatch.loaiKeToan;
  }
  
  // Find partial match by category and subcategory
  const partialMatch = categories.find(cat =>
    cat.loaiKhoanChi === expenseCategory &&
    cat.danhMucChung === expenseSubCategory
  );
  
  if (partialMatch) {
    return partialMatch.loaiKeToan;
  }
  
  // Find match by category only
  const categoryMatch = categories.find(cat =>
    cat.loaiKhoanChi === expenseCategory &&
    !cat.danhMucChung
  );
  
  if (categoryMatch) {
    return categoryMatch.loaiKeToan;
  }
  
  // Default rules if no match found
  if (expenseCategory) {
    if (expenseCategory.includes('Sinh hoạt') || expenseCategory.includes('cá nhân')) {
      return ACCOUNTING_TYPES.NON_RELATED;
    }
    
    if (expenseCategory.includes('Kinh doanh')) {
      // Check if it's direct cost
      if (expenseSubCategory && 
          (expenseSubCategory.includes('Chi phí phần mềm') || 
           expenseSubCategory.includes('Chi phí hàng hóa') ||
           expenseSubCategory.includes('Mua license'))) {
        return ACCOUNTING_TYPES.COGS;
      }
      // Otherwise it's operating expense
      return ACCOUNTING_TYPES.OPEX;
    }
    
    if (expenseCategory.includes('Vận hành') || 
        expenseCategory.includes('Marketing') ||
        expenseCategory.includes('Quảng cáo')) {
      return ACCOUNTING_TYPES.OPEX;
    }
  }
  
  // Default to OPEX if cannot determine
  return ACCOUNTING_TYPES.OPEX;
}

/**
 * Clear the cache (useful when categories are updated)
 */
export function clearAccountingTypeCache() {
  expenseCategoriesCache = null;
  lastFetchTime = null;
}

/**
 * Get accounting type display name
 */
export function getAccountingTypeDisplayName(type) {
  switch (type) {
    case ACCOUNTING_TYPES.COGS:
      return 'Giá vốn hàng bán';
    case ACCOUNTING_TYPES.OPEX:
      return 'Chi phí vận hành';
    case ACCOUNTING_TYPES.NON_RELATED:
      return 'Không liên quan';
    default:
      return type;
  }
}