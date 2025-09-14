// Переключение между вкладками
function switchTab(tabName) {
  // Скрываем все вкладки контента
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
    content.classList.remove('active');
  });

  // Убираем активный класс у всех навигационных вкладок
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.classList.remove('active');
  });

  // Показываем выбранную вкладку
  const targetTab = document.getElementById(tabName);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  // Добавляем активный класс к соответствующей навигационной вкладке
  const activeNavTab = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeNavTab) {
    activeNavTab.classList.add('active');
  }
}

// Сохранить данные профиля
function saveProfileData(formData) {
  try {
    // В реальном приложении здесь был бы запрос к серверу
    // Для демонстрации сохраняем в localStorage
    const currentUser = JSON.parse(localStorage.getItem('user-profile') || '{}');
    const updatedUser = { ...currentUser, ...formData };
    localStorage.setItem('user-profile', JSON.stringify(updatedUser));

    showProfileNotification('Данные профиля сохранены', 'success');
    return true;
  } catch (error) {
    console.error('Ошибка сохранения профиля:', error);
    showProfileNotification('Ошибка при сохранении данных', 'error');
    return false;
  }
}

// Сохранить настройки
function saveSettings(settings) {
  try {
    localStorage.setItem('user-settings', JSON.stringify(settings));
    showProfileNotification('Настройки сохранены', 'success');
    return true;
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error);
    showProfileNotification('Ошибка при сохранении настроек', 'error');
    return false;
  }
}

// Загрузить настройки
function loadSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('user-settings') || '{}');

    // Применяем загруженные настройки к форме
    if (settings.orderUpdates !== undefined) {
      const orderUpdatesCheckbox = document.getElementById('orderUpdates');
      if (orderUpdatesCheckbox) {
        orderUpdatesCheckbox.checked = settings.orderUpdates;
      }
    }

    if (settings.promoUpdates !== undefined) {
      const promoUpdatesCheckbox = document.getElementById('promoUpdates');
      if (promoUpdatesCheckbox) {
        promoUpdatesCheckbox.checked = settings.promoUpdates;
      }
    }

    if (settings.newProducts !== undefined) {
      const newProductsCheckbox = document.getElementById('newProducts');
      if (newProductsCheckbox) {
        newProductsCheckbox.checked = settings.newProducts;
      }
    }

    if (settings.language) {
      const languageSelect = document.getElementById('language');
      if (languageSelect) {
        languageSelect.value = settings.language;
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки настроек:', error);
  }
}

// Показать модальное окно смены пароля
function showChangePasswordModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Изменить пароль</h3>
        <button class="modal-close" onclick="closeModal(this)">&times;</button>
      </div>
      <div class="modal-body">
        <form id="changePasswordForm">
          <div class="form-group">
            <label for="currentPassword">Текущий пароль:</label>
            <input type="password" id="currentPassword" required>
          </div>
          <div class="form-group">
            <label for="newPassword">Новый пароль:</label>
            <input type="password" id="newPassword" required minlength="6">
          </div>
          <div class="form-group">
            <label for="confirmPassword">Подтвердите пароль:</label>
            <input type="password" id="confirmPassword" required minlength="6">
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="closeModal(this)">Отмена</button>
            <button type="submit" class="btn btn-primary">Изменить пароль</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Обработчик формы смены пароля
  const form = document.getElementById('changePasswordForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Валидация
    if (newPassword !== confirmPassword) {
      showProfileNotification('Пароли не совпадают', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showProfileNotification('Пароль должен содержать не менее 6 символов', 'error');
      return;
    }

    // В реальном приложении здесь был бы запрос к серверу
    showProfileNotification('Пароль успешно изменен', 'success');
    closeModal(modal.querySelector('.modal-close'));
  });
}

// Закрыть модальное окно
function closeModal(button) {
  const modal = button.closest('.modal');
  if (modal) {
    modal.remove();
  }
}

// Показать уведомление в профиле
function showProfileNotification(message, type = 'info') {
  // Удаляем существующие уведомления
  const existingNotifications = document.querySelectorAll('.profile-notification');
  existingNotifications.forEach(notification => notification.remove());

  const notification = document.createElement('div');
  notification.className = `profile-notification notification-${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">&times;</button>
  `;

  // Вставляем уведомление в профиль
  const profileHeader = document.querySelector('.profile-header');
  if (profileHeader) {
    profileHeader.appendChild(notification);
  } else {
    document.body.appendChild(notification);
  }

  // Автоматически убираем уведомление через 3 секунды
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 3000);
}

// Загрузить мок-данные заказов
function loadMockOrders() {
  const orders = [
    {
      id: '12345',
      status: 'DELIVERED',
      total: 1398,
      createdAt: '2024-03-15',
      items: [
        { title: 'Наруто том 1', quantity: 1, price: 599 },
        { title: 'Атака титанов том 1', quantity: 1, price: 699 }
      ]
    },
    {
      id: '12346',
      status: 'PROCESSING',
      total: 579,
      createdAt: '2024-03-20',
      items: [
        { title: 'Моя геройская академия том 1', quantity: 1, price: 579 }
      ]
    }
  ];

  return orders;
}

// Загрузить мок-данные отзывов
function loadMockReviews() {
  const reviews = [
    {
      id: 1,
      manga: { title: 'Наруто том 1' },
      rating: 5,
      comment: 'Отличная манга! Рекомендую всем любителям жанра.',
      createdAt: '2024-03-16'
    },
    {
      id: 2,
      manga: { title: 'Атака титанов том 1' },
      rating: 4,
      comment: 'Очень захватывающий сюжет, не могу оторваться.',
      createdAt: '2024-03-17'
    }
  ];

  return reviews;
}

// Отформатировать дату
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Получить текст статуса заказа на русском
function getStatusText(status) {
  const statusTexts = {
    'PENDING': 'В обработке',
    'PROCESSING': 'Обрабатывается',
    'SHIPPED': 'Отправлен',
    'DELIVERED': 'Доставлен',
    'CANCELLED': 'Отменен'
  };

  return statusTexts[status] || status;
}

// Инициализация страницы профиля
function initializeProfile() {
  // Обработчики навигации по вкладкам
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = tab.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Обработчик формы профиля
  const profileForm = document.querySelector('.profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(profileForm);
      const profileData = {};

      for (let [key, value] of formData.entries()) {
        profileData[key] = value;
      }

      saveProfileData(profileData);
    });
  }

  // Обработчик формы настроек
  const settingsForm = document.querySelector('.settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const settings = {
        orderUpdates: document.getElementById('orderUpdates')?.checked || false,
        promoUpdates: document.getElementById('promoUpdates')?.checked || false,
        newProducts: document.getElementById('newProducts')?.checked || false,
        language: document.getElementById('language')?.value || 'ru'
      };

      saveSettings(settings);
    });
  }

  // Обработчик кнопки смены пароля
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', showChangePasswordModal);
  }

  // Загружаем настройки
  loadSettings();
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/profile') {
    initializeProfile();
  }
});

// Экспорт функций для использования в HTML
window.switchTab = switchTab;
window.showChangePasswordModal = showChangePasswordModal;
window.closeModal = closeModal;