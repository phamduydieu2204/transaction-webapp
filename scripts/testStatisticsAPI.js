// Thêm vào console để test API trực tiếp
async function testStatisticsAPI() {
  const BACKEND_URL = 'https://sleepy-bastion-81523-f30e287dba50.herokuapp.com/api/proxy';
  
  console.log('🧪 Testing Statistics API...');
  
  // Test 1: Get transactions
  try {
    console.log('📡 Testing getStatisticsData - transactions');
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getStatisticsData',
        type: 'transactions',
        filters: {
          timeRange: 'month',
          startDate: '2024/01/01',
          endDate: '2024/12/31'
        },
        maNhanVien: window.userInfo?.maNhanVien || ''
      })
    });
    
    const result = await response.json();
    console.log('📈 Transaction API result:', result);
    
    if (result.status === 'success' && result.data) {
      console.log('✅ Found', result.data.length, 'transactions');
      console.log('📊 Sample transaction:', result.data[0]);
      
      // Test revenue sum
      const totalRevenue = result.data.reduce((sum, t) => sum + (t.revenue || 0), 0);
      console.log('💰 Total revenue:', totalRevenue);
    } else {
      console.error('❌ Transaction API failed:', result);
    }
  } catch (error) {
    console.error('❌ Transaction API error:', error);
  }
  
  // Test 2: Get expenses
  try {
    console.log('📡 Testing getStatisticsData - expenses');
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getStatisticsData',
        type: 'expenses',
        filters: {
          timeRange: 'month',
          startDate: '2024/01/01',
          endDate: '2024/12/31'
        }
      })
    });
    
    const result = await response.json();
    console.log('💸 Expense API result:', result);
    
    if (result.status === 'success' && result.data) {
      console.log('✅ Found', result.data.length, 'expenses');
      console.log('📊 Sample expense:', result.data[0]);
      
      // Test expense sum
      const totalExpense = result.data.reduce((sum, e) => sum + (e.amount || 0), 0);
      console.log('💸 Total expense:', totalExpense);
    } else {
      console.error('❌ Expense API failed:', result);
    }
  } catch (error) {
    console.error('❌ Expense API error:', error);
  }
  
  // Test 3: Simple transactions API
  try {
    console.log('📡 Testing getTransactions (simple)');
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getTransactions',
        maNhanVien: window.userInfo?.maNhanVien || '',
        vaiTro: window.userInfo?.vaiTro || '',
        giaoDichNhinThay: window.userInfo?.giaoDichNhinThay || '',
        nhinThayGiaoDichCuaAi: window.userInfo?.nhinThayGiaoDichCuaAi || ''
      })
    });
    
    const result = await response.json();
    console.log('📋 Simple transactions result:', result);
    
    if (result.status === 'success' && result.data) {
      console.log('✅ Found', result.data.length, 'simple transactions');
      
      // Group by date for chart data
      const revenueByDate = {};
      result.data.forEach(t => {
        const date = t.transactionDate;
        if (!revenueByDate[date]) revenueByDate[date] = 0;
        revenueByDate[date] += parseFloat(t.revenue) || 0;
      });
      
      console.log('📊 Revenue by date:', revenueByDate);
      console.log('📊 Dates available:', Object.keys(revenueByDate).sort());
    }
  } catch (error) {
    console.error('❌ Simple transactions error:', error);
  }
}

// Chạy test
testStatisticsAPI();