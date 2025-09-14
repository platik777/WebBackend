// Упрощенная версия main.js - убираем API мок-функции, оставляем только корзину и базовый функционал

// Конфигурация приложения
const APP_CONFIG = {
  cartStorageKey: 'manga-cart',
  userStorageKey: 'user-profile',
  settingsStorageKey: 'user-settings'
};

// Мок-данные для каталога (ТОЛЬКО для корзины, каталог теперь из БД)
function getMockMangaData(id) {
  // Эти данные используются только для корзины localStorage
  const mockData = {
    1: { title: 'Наруто', price: 599, imageUrl: '/images/naruto.jpg', inStock: true, author: 'Масаси Кисимото' },
    2: { title: 'Атака титанов', price: 699, imageUrl: '/images/aot.jpg', inStock: true, author: 'Хадзиме Исаяма' },
    3: { title: 'Ван Пис', price: 549, imageUrl: '/images/onepiece.jpg', inStock: false, author: 'Эйитиро Ода' },
    4: { title: 'Моя геройская академия', price: 579, imageUrl: '/images/mha.jpg', inStock: true, author: 'Кохэй Хорикоси' },
    5: { title: 'Берсерк', price: 799, imageUrl: '/images/berserk.jpg', inStock: true, author: 'Кэнтаро Миура' },
    6: { title: 'Магическая битва', price: 659, imageUrl: '/images/jjk.jpg', inStock: true, author: 'Гэгэ Акутами' },
    7: { title: 'Убийца демонов', price: 619, imageUrl: '/images/demon-slayer.jpg', inStock: true, author: 'Коёхару Готогэ' },
    8: { title: 'Мобильный воин Гандам', price: 729, imageUrl: '/images/gundam.jpg', inStock: false, author: 'Ёсиюки Томино' }
  };

  return mockData[id] || {
    title: 'Неизвестная манга',
    price: 500,
    imageUrl: '/images/placeholder.jpg',
    inStock: false,
    author: 'Неизвестный автор'
  };
}

// Инициализация кнопок добавления в корзину
function initializeAddToCartButtons() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const mangaId = parseInt(button.getAttribute('data-manga-id'));
      const mangaData = getMockMangaData(mangaId);

      if (window.addToCart) {
        window.addToCart(mangaId, mangaData);
        showNotification(`"${mangaData.title}" добавлена в корзину!`, 'success');
      }
    });
  });
}

// ВОССТАНОВЛЕННАЯ ФУНКЦИЯ ПОИСКА
function initializeSearch() {
  const searchForm = document.querySelector('.search-container');
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-btn');

  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const searchTerm = searchInput?.value?.trim();
      if (searchTerm) {
        performSearch(searchTerm);
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const searchTerm = e.target.value?.trim();
        if (searchTerm) {
          performSearch(searchTerm);
        }
      }
    });
  }
}

// Простая заглушка для фильтров (не работают)
function initializeFilters() {
  const filterSelects = document.querySelectorAll('.filter-select');
  filterSelects.forEach(select => {
    select.addEventListener('change', () => {
      showNotification('Фильтры временно недоступны', 'info');
    });
  });

  const clearFiltersBtn = document.getElementById('clearFilters');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      filterSelects.forEach(select => {
        select.value = '';
      });
      showNotification('Фильтры очищены', 'info');
    });
  }
}

// Заглушки для экспорта (для совместимости)
function clearFilters() {
  const filterSelects = document.querySelectorAll('.filter-select');
  filterSelects.forEach(select => {
    select.value = '';
  });
  showNotification('Фильтры очищены', 'info');
}

function performSearch(query) {
  showNotification('Поиск временно недоступен', 'info');
  return [];
}

// Обработка глобальных ошибок
function handleGlobalError(error) {
  console.error('Глобальная ошибка:', error);

  const notification = document.createElement('div');
  notification.className = 'notification notification-error';
  notification.innerHTML = `
    <span>Произошла ошибка в приложении. Попробуйте обновить страницу.</span>
    <button onclick="this.parentElement.remove()">&times;</button>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Универсальная система уведомлений
function showNotification(message, type = 'info') {
  // Удалить существующие уведомления
  const existing = document.querySelectorAll('.main-notification');
  existing.forEach(n => n.remove());

  const notification = document.createElement('div');
  notification.className = `main-notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-width: 300px;
    animation: slideInRight 0.3s ease;
    font-family: Inter, sans-serif;
  `;

  // Стили в зависимости от типа
  const styles = {
    success: { background: '#d4edda', borderLeft: '4px solid #28a745', color: '#155724' },
    error: { background: '#f8d7da', borderLeft: '4px solid #dc3545', color: '#721c24' },
    warning: { background: '#fff3cd', borderLeft: '4px solid #ffc107', color: '#856404' },
    info: { background: '#d1ecf1', borderLeft: '4px solid #17a2b8', color: '#0c5460' }
  };

  const style = styles[type] || styles.info;
  notification.style.background = style.background;
  notification.style.borderLeft = style.borderLeft;
  notification.style.color = style.color;

  notification.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit; margin-left: 1rem;">
        &times;
      </button>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Инициализация приложения
function initializeApp() {
  console.log('Manga Store - Инициализация приложения');

  // Инициализируем корзину
  if (window.updateCartCounter) {
    window.updateCartCounter();
  }

  // Инициализируем кнопки добавления в корзину
  initializeAddToCartButtons();

  // Инициализируем поиск (заглушка)
  initializeSearch();

  // Инициализируем фильтры (заглушка), если мы на странице каталога
  if (window.location.pathname === '/catalog') {
    initializeFilters();
  }

  // Обработчик глобальных ошибок
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', (e) => {
    handleGlobalError(e.reason);
  });

  console.log('Приложение инициализировано успешно');
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initializeApp);

// CSS анимации для уведомлений
if (!document.querySelector('#mainNotificationStyles')) {
  const style = document.createElement('style');
  style.id = 'mainNotificationStyles';
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

// Экспорт функций для использования в других файлах
window.getMockMangaData = getMockMangaData;
window.clearFilters = clearFilters;
window.performSearch = performSearch;
window.showNotification = showNotification;