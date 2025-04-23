// Trả về các hằng số cấu hình của ứng dụng
function getConstants() {
  return {
    // URL của backend proxy, lấy từ biến môi trường hoặc giá trị mặc định
    BACKEND_URL: typeof process !== 'undefined' && process.env.BACKEND_URL
      ? process.env.BACKEND_URL
      : 'https://sleepy-bastion-81523-f30e287dba50.herokuapp.com/api/proxy'
  };
}
