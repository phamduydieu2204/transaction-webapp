/**
 * Nạp nội dung HTML từ file vào một container cụ thể.
 * @param {string} containerId - ID của phần tử DOM cần chèn nội dung vào.
 * @param {string} filePath - Đường dẫn tới file HTML cần tải.
 */
export async function loadHTML(containerId, filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Lỗi khi tải ${filePath}: ${response.status}`);
  
      const html = await response.text();
      document.getElementById(containerId).innerHTML = html;
    } catch (error) {
      console.error(`❌ loadHTML error: ${error.message}`);
      const fallback = document.getElementById(containerId);
      if (fallback) {
        fallback.innerHTML = `<div style="color:red;">Không thể tải ${filePath}</div>`;
      }
    }
  }
  