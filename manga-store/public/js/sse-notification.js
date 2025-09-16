class SSENotifications {
  constructor() {
    this.eventSource = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;

    this.init();
  }

  init() {
    if (typeof(EventSource) === "undefined") {
      console.warn('Server-sent events не поддерживаются этим браузером');
      return;
    }

    this.connect();
    this.initToastContainer();
  }

  connect() {
    try {
      this.eventSource = new EventSource('/api/orders/events');

      this.eventSource.onopen = (event) => {
        console.log('SSE соединение установлено');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.showConnectionStatus('connected');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleOrderUpdate(data);
        } catch (error) {
          console.error('Ошибка парсинга SSE данных:', error);
        }
      };

      this.eventSource.onerror = (event) => {
        console.error('SSE ошибка:', event);
        this.isConnected = false;
        this.showConnectionStatus('disconnected');

        this.attemptReconnect();
      };

    } catch (error) {
      console.error('Ошибка подключения к SSE:', error);
    }
  }

  handleOrderUpdate(data) {
    console.log('Получено обновление заказа:', data);

    if (data.updates && data.updates.length > 0) {
      data.updates.forEach(update => {
        this.processUpdate(update);
      });
    } else if (data.type) {
      this.processUpdate(data);
    }
  }

  processUpdate(update) {
    switch (update.type) {
      case 'new_order':
        this.showNotification(
          'Новый заказ!',
          update.message || `Получен новый заказ #${update.orderId}`,
          'success'
        );
        this.updateOrdersList();
        break;

      case 'status_update':
        this.showNotification(
          'Обновление статуса',
          update.message || `Статус заказа #${update.orderId} изменен`,
          'info'
        );
        this.updateOrderStatus(update.orderId, update.newStatus);
        break;

      case 'order_deleted':
        this.showNotification(
          'Заказ удален',
          update.message || `Заказ #${update.orderId} был удален`,
          'warning'
        );
        this.removeOrderFromList(update.orderId);
        break;

      default:
        console.log('Неизвестный тип обновления:', update.type);
    }
  }

  showNotification(title, message, type = 'info') {
    // Создаем уведомление с помощью встроенной системы
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
        <button class="notification-close">&times;</button>
      </div>
    `;

    // Добавляем в контейнер
    const container = document.getElementById('notification-container');
    if (container) {
      container.appendChild(notification);

      // Показываем уведомление
      setTimeout(() => {
        notification.classList.add('show');
      }, 100);

      // Автоматически скрываем через 5 секунд
      setTimeout(() => {
        this.hideNotification(notification);
      }, 5000);

      // Обработчик закрытия
      const closeBtn = notification.querySelector('.notification-close');
      closeBtn.addEventListener('click', () => {
        this.hideNotification(notification);
      });
    } else {
      // Fallback на console.log если нет контейнера
      console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    }
  }

  hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  initToastContainer() {
    // Создаем контейнер для уведомлений если его нет
    if (!document.getElementById('notification-container')) {
      const container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
  }

  updateOrdersList() {
    // Обновляем список заказов на странице, если он есть
    const ordersList = document.querySelector('.orders-list');
    if (ordersList) {
      // Можно добавить логику обновления списка без перезагрузки страницы
      location.reload(); // Простое решение - перезагрузка
    }
  }

  updateOrderStatus(orderId, newStatus) {
    // Обновляем статус конкретного заказа на странице
    const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
    if (orderCard) {
      const statusBadge = orderCard.querySelector('.status-badge');
      if (statusBadge) {
        statusBadge.className = `status-badge status-${newStatus}`;
        statusBadge.textContent = this.getStatusText(newStatus);
      }
    }
  }

  removeOrderFromList(orderId) {
    // Удаляем заказ из списка на странице
    const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
    if (orderCard) {
      orderCard.style.transition = 'opacity 0.3s ease';
      orderCard.style.opacity = '0';
      setTimeout(() => {
        if (orderCard.parentNode) {
          orderCard.parentNode.removeChild(orderCard);
        }
      }, 300);
    }
  }

  getStatusText(status) {
    const statusTexts = {
      'PENDING': 'Ожидает обработки',
      'PROCESSING': 'В обработке',
      'SHIPPED': 'Отправлен',
      'DELIVERED': 'Доставлен',
      'CANCELLED': 'Отменен'
    };
    return statusTexts[status] || status;
  }

  showConnectionStatus(status) {
    const statusElement = document.getElementById('sse-status');
    if (statusElement) {
      statusElement.className = `sse-status ${status}`;
      statusElement.textContent = status === 'connected'
        ? 'Уведомления включены'
        : 'Соединение потеряно';
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Попытка переподключения #${this.reconnectAttempts}`);

      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Максимальное количество попыток переподключения достигнуто');
      this.showNotification(
        'Ошибка соединения',
        'Не удалось восстановить соединение для уведомлений',
        'error'
      );
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.isConnected = false;
      console.log('SSE соединение закрыто');
    }
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Инициализируем SSE только на нужных страницах
  const shouldInitSSE = document.querySelector('.orders-page, .admin-page, .dashboard-page');

  if (shouldInitSSE) {
    window.sseNotifications = new SSENotifications();
  }
});

// Закрываем соединение при уходе со страницы
window.addEventListener('beforeunload', function() {
  if (window.sseNotifications) {
    window.sseNotifications.disconnect();
  }
});