export function closeProcessingModal() {
  const modal = document.getElementById("processingModal");
  modal.style.display = "none";
  document.getElementById("modalMessage").style.color = "black";

  // ✅ Cho phép người dùng tương tác trở lại
  document.querySelectorAll("input, select, textarea, button").forEach(element => {
    element.disabled = false;
  });
}
