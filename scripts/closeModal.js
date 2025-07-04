// closeModal.js

export function closeModal() {
  const modal = document.getElementById("transactionDetailModal");
  if (modal) {
    modal.style.display = "none";
  }
}
