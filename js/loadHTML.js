export async function loadHTML(id, file) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`Không thể tải ${file}`);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  } catch (error) {
    console.error(`Lỗi khi tải ${file}:`, error);
  }
}