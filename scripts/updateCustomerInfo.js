export function updateCustomerInfo(transactionList) {
    const email = document.getElementById("customerEmail").value.toLowerCase();
    const customerNameInput = document.getElementById("customerName");
    const customerPhoneInput = document.getElementById("customerPhone");
  
    customerNameInput.value = "";
    customerPhoneInput.value = "";
    customerNameInput.placeholder = "Đang tìm kiếm...";
    customerPhoneInput.placeholder = "Đang tìm kiếm...";
  
    const transaction = transactionList.find(t => t.customerEmail.toLowerCase() === email);
  
    if (transaction) {
      customerNameInput.value = transaction.customerName || "";
      customerPhoneInput.value = transaction.customerPhone || "";
    } else {
      customerNameInput.value = "";
      customerPhoneInput.value = "";
    }
  
    customerNameInput.placeholder = "";
    customerPhoneInput.placeholder = "";
  }