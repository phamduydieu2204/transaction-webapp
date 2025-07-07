/**
 * Unified Detail Modal Component
 * Sử dụng cho cả transaction và expense view
 */

import { copyToClipboard } from './copyToClipboard.js';

export class DetailModal {
  constructor() {
    this.modal = null;
    this.isOpen = false;
    this.createModal();
  }

  createModal() {
    // Tạo modal structure
    const modalHtml = `
      <div id="unifiedDetailModal" class="detail-modal">
        <div class="detail-modal-content">
          <div class="detail-modal-header">
            <h2 id="detailModalTitle" class="detail-modal-title">Chi tiết</h2>
            <button class="detail-modal-close" onclick="window.detailModal.close()">&times;</button>
          </div>
          <div class="detail-modal-body">
            <div id="detailModalContent"></div>
          </div>
          <div class="detail-modal-footer">
            <button class="btn" onclick="window.detailModal.close()">Đóng</button>
          </div>
        </div>
      </div>
    `;

    // Thêm modal vào DOM nếu chưa có
    if (!document.getElementById('unifiedDetailModal')) {
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    this.modal = document.getElementById('unifiedDetailModal');
    this.content = document.getElementById('detailModalContent');
    this.title = document.getElementById('detailModalTitle');

    // Event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Click outside để đóng
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // ESC key để đóng
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  show(title, fields, options = {}) {
    this.title.textContent = title;
    this.renderContent(fields, options);
    this.modal.style.display = 'flex';
    this.modal.classList.add('show');
    this.isOpen = true;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.remove('show');
    setTimeout(() => {
      this.modal.style.display = 'none';
      this.isOpen = false;
      // Restore body scroll
      document.body.style.overflow = '';
    }, 300);
  }

  renderContent(fields, options = {}) {
    this.content.innerHTML = '';

    fields.forEach(field => {
      if (!field.value && field.value !== 0) return; // Skip empty fields

      const row = document.createElement('div');
      row.className = 'detail-row';
      
      if (field.important) {
        row.classList.add('important');
      }

      const label = document.createElement('div');
      label.className = 'detail-label';
      label.textContent = field.label + ':';

      const valueContainer = document.createElement('div');
      valueContainer.className = 'detail-value';

      // Format value based on type
      let displayValue = this.formatValue(field.value, field.type);
      valueContainer.innerHTML = displayValue;

      // Add copy button if needed
      if (field.showCopy && field.value) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋'; // Copy icon
        copyBtn.title = 'Sao chép'; // Tooltip
        copyBtn.onclick = () => this.copyValue(field.value, field.label);
        valueContainer.appendChild(copyBtn);
      }

      // Add external link if needed
      if (field.showExternalLink && field.value) {
        const linkBtn = document.createElement('a');
        linkBtn.className = 'external-link-btn';
        linkBtn.textContent = 'Mở';
        linkBtn.href = this.createExternalLink(field.value, field.type);
        linkBtn.target = '_blank';
        linkBtn.rel = 'noopener noreferrer';
        valueContainer.appendChild(linkBtn);
      }

      row.appendChild(label);
      row.appendChild(valueContainer);
      this.content.appendChild(row);
    });
  }

  formatValue(value, type) {
    if (!value && value !== 0) return '-';

    switch (type) {
      case 'currency':
        return `<span class="currency-value">${parseInt(value).toLocaleString()} VND</span>`;
      
      case 'status':
        const statusClass = this.getStatusClass(value);
        return `<span class="${statusClass}">${value}</span>`;
      
      case 'email':
        return `<a href="mailto:${value}" style="color: #3498db;">${value}</a>`;
      
      case 'phone':
        return `<a href="tel:${value}" style="color: #3498db;">${value}</a>`;
      
      case 'link':
        if (value.startsWith('http')) {
          return `<a href="${value}" target="_blank" rel="noopener" style="color: #3498db;">${value}</a>`;
        }
        return value;
      
      case 'date':
        // Format date if needed
        return value;
      
      default:
        return value;
    }
  }

  getStatusClass(status) {
    if (!status) return '';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('đã thanh toán') || statusLower.includes('hoàn thành')) {
      return 'status-paid';
    } else if (statusLower.includes('chưa thanh toán') || statusLower.includes('pending')) {
      return 'status-unpaid';
    } else if (statusLower.includes('đang xử lý')) {
      return 'status-pending';
    }
    return '';
  }

  createExternalLink(value, type) {
    switch (type) {
      case 'phone':
        return `tel:${value}`;
      case 'email':
        return `mailto:${value}`;
      default:
        return value;
    }
  }

  async copyValue(value, label) {
    try {
      await navigator.clipboard.writeText(value);
      this.showCopyFeedback(label);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  showCopyFeedback(label) {
    // Simple feedback - có thể enhance sau
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #48bb78;
      color: white;
      padding: 10px 15px;
      border-radius: 6px;
      z-index: 99999;
      animation: fadeIn 0.3s ease;
    `;
    feedback.textContent = `Đã copy ${label}`;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.remove();
    }, 2000);
  }
}

// Export singleton instance
export const detailModal = new DetailModal();

// Make available globally
window.detailModal = detailModal;