// Конфигурация приложения
const APP_CONFIG = {
  cartStorageKey: 'manga-cart',
  userStorageKey: 'user-profile',
  settingsStorageKey: 'user-settings'
};

// Инициализация кнопок добавления в корзину
function initializeAddToCartButtons() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const mangaId = parseInt(button.getAttribute('data-manga-id'));

      // Пробуем получить данные из карточки манги (data-атрибуты)
      const mangaCard = button.closest('.manga-card');
      let mangaData = null;

      if (mangaCard) {
        mangaData = {
          title: mangaCard.getAttribute('data-title') || 'Неизвестная манга',
          author: mangaCard.getAttribute('data-author') || 'Неизвестный автор',
          price: parseFloat(mangaCard.getAttribute('data-price')) || 500,
          imageUrl: mangaCard.querySelector('img')?.src || '/images/placeholder.jpg',
          inStock: mangaCard.getAttribute('data-stock') === '1'
        };
      } else {
        // Fallback к мок-данным
        mangaData = getMockMangaData(mangaId);
      }

      if (window.addToCart) {
        window.addToCart(mangaId, mangaData);
        // Уведомление будет показано внутри addToCart
      } else {
        showNotification('Ошибка: функция корзины недоступна', 'error');
      }
    });
  });
}

// Функция поиска
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

// Реализация поиска через перенаправление на каталог с параметром поиска
function performSearch(query) {
  if (!query || query.trim() === '') {
    showNotification('Введите запрос для поиска', 'warning');
    return;
  }

  // Перенаправляем на каталог с параметром поиска
  const searchUrl = `/catalog?search=${encodeURIComponent(query.trim())}`;
  window.location.href = searchUrl;
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
  Object.assign(notification.style, style);

  notification.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit;">&times;</button>
    </div>
  `;

  document.body.appendChild(notification);

  // Автоматически убираем через 5 секунд
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

// CSS анимации для уведомлений
if (!document.querySelector('#notification-styles')) {
  const styles = document.createElement('style');
  styles.id = 'notification-styles';
  styles.textContent = `
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
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(styles);
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем поиск
  initializeSearch();

  // Инициализируем кнопки добавления в корзину
  initializeAddToCartButtons();

  // Обработка глобальных ошибок
  window.addEventListener('error', (event) => {
    handleGlobalError(event.error);
  });

  // Обработка необработанных Promise ошибок
  window.addEventListener('unhandledrejection', (event) => {
    handleGlobalError(event.reason);
  });
});

// Экспорт функций для использования в других модулях
window.initializeAddToCartButtons = initializeAddToCartButtons;
window.performSearch = performSearch;
window.showNotification = showNotification;