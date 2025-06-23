// handleAddChiPhi.js
  };
  });
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    if (result.status === "success") {
      showResultModal("Chi phí đã được lưu!", true);
      document.getElementById("chiPhiForm").reset();
    } else {
      showResultModal(result.message || "Không thể lưu chi phí!", false);
    }
  } catch (err) {
    showResultModal(`Lỗi kết nối server: ${err.message}`, false);
    console.error("Lỗi khi thêm chi phí:", err);
  }
}
