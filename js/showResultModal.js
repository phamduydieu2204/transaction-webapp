export function showResultModal(message, isSuccess) {
    const modal = document.getElementById("resultModal");
    const messageElement = document.getElementById("resultMessage");
    messageElement.textContent = message;
    messageElement.style.color = isSuccess ? "green" : "red";
    modal.style.display = "block";
    setTimeout(() => {
      modal.style.display = "none";
    }, 3000);
  }