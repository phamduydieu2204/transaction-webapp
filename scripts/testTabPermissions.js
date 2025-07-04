// Test tab permissions parsing
console.log('=== Testing Tab Permissions ===');

const TAB_MAPPING = {
  'tất cả': ['giao-dich', 'chi-phi', 'thong-ke', 'bao-cao', 'cai-dat'],
  'giao dịch': ['giao-dich'],
  'chi phí': ['chi-phi'],
  'thống kê': ['thong-ke'],
  'báo cáo': ['bao-cao'],
  'cài đặt': ['cai-dat']
};

// Test different input formats
const testInputs = [
  "tất cả",
  "tất cả, giao dịch",
  "tất cả|giao dịch", 
  "giao dịch",
  "chi phí",
  "giao dịch|chi phí",
  "giao dịch, chi phí"
];

testInputs.forEach(input => {
  // console.log(`\n📝 Testing input: "${input}"`);
  
  // Split by | or , and trim
  const permissions = input.split(/[|,]/).map(p => p.trim()).filter(p => p.length > 0);
  console.log('  Parsed permissions:', permissions);
  
  const allowedTabs = new Set();
  permissions.forEach(permission => {
    console.log(`  Checking: "${permission}"`);
    if (TAB_MAPPING[permission]) {
      // console.log(`    ✅ Found: ${TAB_MAPPING[permission]}`);
      TAB_MAPPING[permission].forEach(tabId => allowedTabs.add(tabId));
    } else {
      // console.log(`    ❌ Not found`);
    }
  });
  
  console.log('  Final allowed tabs:', Array.from(allowedTabs));
});

// console.log('\n🗂️ Available mappings:');
Object.entries(TAB_MAPPING).forEach(([key, value]) => {
  console.log(`  "${key}" -> ${value}`);
});