export function copyToClipboard(text, iconElement) {
    navigator.clipboard.writeText(text)
      .then(() => {
        const message = document.createElement("span");
        message.className = "copy-message";
        message.textContent = "Đã copy";
        iconElement.appendChild(message);
  
        message.classList.add("show");
  
        setTimeout(() => {
          message.classList.remove("show");
          setTimeout(() => {
            if (message.parentNode) {
              message.parentNode.removeChild(message);
            }
          }, 300);
        }, 1000);
      })
      .catch(err => {
        console.error("Lỗi khi copy nội dung: ", err);
      });
  }