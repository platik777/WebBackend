// Конфигурация приложения
const APP_CONFIG = {
  apiBaseUrl: '/api',
  cartStorageKey: 'manga-cart',
  userStorageKey: 'user-profile',
  settingsStorageKey: 'user-settings'
};

// API функции (базовые заглушки)
async function apiRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  try {
    const response = await fetch(APP_CONFIG.apiBaseUrl + url, {
      ...defaultOptions,
      ...options
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// API функции для манги
async function getMangaList(filters = {}) {
  // В реальном приложении здесь был бы запрос к серверу
  // Возвращаем мок-данные
  return getMockMangaList(filters);
}

async function getMangaById(id) {
  // В реальном приложении здесь был бы запрос к серверу
  const mockData = getMockMangaData(id);
  return mockData.title ? mockData : null;
}

async function getFeaturedManga() {
  // Возвращаем первые 6 товаров как рекомендуемые
  const allManga = getMockMangaList();
  return allManga.slice(0, 6);
}

// Мок-данные для каталога
function getMockMangaList(filters = {}) {
  const allManga = [
    { id: 1, title: 'Наруто', price: 599, imageUrl: '/images/naruto.jpg', inStock: true, author: 'Масаси Кисимото', genre: 'Сёнен', rating: 5 },
    { id: 2, title: 'Атака титанов', price: 699, imageUrl: '/images/aot.jpg', inStock: true, author: 'Хадзиме Исаяма', genre: 'Сёнен', rating: 5 },
    { id: 3, title: 'Ван Пис', price: 549, imageUrl: '/images/onepiece.jpg', inStock: false, author: 'Эйитиро Ода', genre: 'Сёнен', rating: 5 },
    { id: 4, title: 'Моя геройская академия', price: 579, imageUrl: '/images/mha.jpg', inStock: true, author: 'Кохэй Хорикоси', genre: 'Сёнен', rating: 4 },
    { id: 5, title: 'Берсерк', price: 799, imageUrl: '/images/berserk.jpg', inStock: true, author: 'Кэнтаро Миура', genre: 'Сэйнэн', rating: 5 },
    { id: 6, title: 'Магическая битва', price: 659, imageUrl: '/images/jjk.jpg', inStock: true, author: 'Гэгэ Акутами', genre: 'Сёнен', rating: 4 },
    { id: 7, title: 'Убийца демонов', price: 619, imageUrl: '/images/demon-slayer.jpg', inStock: true, author: 'Коёхару Готогэ', genre: 'Сёнен', rating: 4 },
    { id: 8, title: 'Мобильный воин Гандам', price: 729, imageUrl: '/images/gundam.jpg', inStock: false, author: 'Ёсиюки Томино', genre: 'Меха', rating: 3 }
  ];

  // Применяем фильтры
  let filteredManga = allManga;

  if (filters.genre) {
    filteredManga = filteredManga.filter(manga => manga.genre === filters.genre);
  }

  if (filters.inStock !== undefined) {
    filteredManga = filteredManga.filter(manga => manga.inStock === filters.inStock);
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredManga = filteredManga.filter(manga =>
      manga.title.toLowerCase().includes(searchTerm) ||
      manga.author.toLowerCase().includes(searchTerm)
    );
  }

  return filteredManga;
}

// Мок-данные для одного товара (дублируем из cart.js для независимости)
function getMockMangaData(id) {
  const mockData = {
    1: { title: 'Наруто', price: 599, imageUrl: '/images/naruto.jpg', inStock: true, author: 'Масаси Кисимото', genre: 'Сёнен', rating: 5 },
    2: { title: 'Атака титанов', price: 699, imageUrl: '/images/aot.jpg', inStock: true, author: 'Хадзиме Исаяма', genre: 'Сёнен', rating: 5 },
    3: { title: 'Ван Пис', price: 549, imageUrl: '/images/onepiece.jpg', inStock: false, author: 'Эйитиро Ода', genre: 'Сёнен', rating: 5 },
    4: { title: 'Моя геройская академия', price: 579, imageUrl: '/images/mha.jpg', inStock: true, author: 'Кохэй Хорикоси', genre: 'Сёнен', rating: 4 },
    5: { title: 'Берсерк', price: 799, imageUrl: '/images/berserk.jpg', inStock: true, author: 'Кэнтаро Миура', genre: 'Сэйнэн', rating: 5 },
    6: { title: 'Магическая битва', price: 659, imageUrl: '/images/jjk.jpg', inStock: true, author: 'Гэгэ Акутами', genre: 'Сёнен', rating: 4 },
    7: { title: 'Убийца демонов', price: 619, imageUrl: '/images/demon-slayer.jpg', inStock: true, author: 'Коёхару Готогэ', genre: 'Сёнен', rating: 4 },
    8: { title: 'Мобильный воин Гандам', price: 729, imageUrl: '/images/gundam.jpg', inStock: false, author: 'Ёсиюки Томино', genre: 'Меха', rating: 3 }
  };

  return mockData[id] || {
    title: 'Неизвестная манга',
    price: 500,
    imageUrl: '/images/placeholder.jpg',
    inStock: false,
    author: 'Неизвестный автор',
    genre: 'Разное',
    rating: 0
  };
}

// Инициализация кнопок "Добавить в корзину"
function initializeAddToCartButtons() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');

  addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const mangaId = this.getAttribute('data-manga-id');
      const quantity = parseInt(this.getAttribute('data-quantity')) || 1;

      if (window.addToCart) {
        window.addToCart(mangaId, quantity);
      } else {
        console.error('addToCart function not found');
      }
    });
  });
}

// Инициализация поиска
function initializeSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-btn');

  if (!searchInput) return;

  // Обработчик для кнопки поиска
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  // Обработчик для Enter в поле поиска
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
}

// Выполнить поиск
function performSearch() {
  const searchInput = document.querySelector('.search-input');
  if (!searchInput) return;

  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    // Перенаправляем на страницу каталога с параметром поиска
    window.location.href = `/catalog?search=${encodeURIComponent(searchTerm)}`;
  }
}

// Инициализация фильтров каталога
function initializeFilters() {
  const container = document.getElementById('mangaContainer');
  if (!container) return;

  const cards = Array.from(container.querySelectorAll('.manga-card'));

  function applyFiltersAndSort() {
    const genre = document.getElementById('genreFilter')?.value || '';
    const stock = document.getElementById('stockFilter')?.value || '';
    const sort = document.getElementById('sortFilter')?.value || '';

    let filteredCards = cards.filter(card => {
      const matchesGenre = !genre || card.dataset.genre?.includes(genre);
      const matchesStock =
        !stock ||
        (stock === 'in-stock' && card.dataset.stock === 'true') ||
        (stock === 'out-of-stock' && card.dataset.stock === 'false');
      return matchesGenre && matchesStock;
    });

    // Сортировка
    if (sort) {
      const [by, order] = sort.split('-');
      filteredCards.sort((a, b) => {
        let valA, valB;

        switch(by) {
          case 'price':
            valA = parseFloat(a.dataset.price) || 0;
            valB = parseFloat(b.dataset.price) || 0;
            break;
          case 'title':
            valA = a.dataset.title?.toLowerCase() || '';
            valB = b.dataset.title?.toLowerCase() || '';
            break;
          case 'rating':
            valA = parseFloat(a.dataset.rating) || 0;
            valB = parseFloat(b.dataset.rating) || 0;
            break;
          default:
            return 0;
        }

        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Скрываем все карточки
    cards.forEach(card => {
      card.style.display = 'none';
    });

    // Показываем отфильтрованные карточки
    filteredCards.forEach(card => {
      card.style.display = 'block';
      container.appendChild(card); // Перемещаем в конец для правильного порядка
    });

    updateFilterResults(filteredCards.length);
  }

  function updateFilterResults(count) {
    const existingMessage = document.querySelector('.filter-results');
    if (existingMessage) existingMessage.remove();

    if (count === 0) {
      const msg = document.createElement('div');
      msg.className = 'filter-results empty-message';
      msg.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <h3>Нет товаров по выбранным фильтрам</h3>
          <p>Попробуйте изменить критерии поиска</p>
          <button class="btn btn-outline" onclick="clearFilters()">Сбросить фильтры</button>
        </div>
      `;
      container.appendChild(msg);
    }
  }

  // Навешиваем обработчики на фильтры
  ['genreFilter', 'stockFilter', 'sortFilter'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', applyFiltersAndSort);
    }
  });

  // Применяем фильтры при загрузке
  applyFiltersAndSort();
}

// Очистить фильтры
function clearFilters() {
  ['genreFilter', 'stockFilter', 'sortFilter'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.value = '';
    }
  });

  // Перезапускаем фильтрацию
  if (window.initializeFilters) {
    initializeFilters();
  }
}

// Отображение ошибок
function handleGlobalError(error) {
  console.error('Global error:', error);

  const notification = document.createElement('div');
  notification.className = 'notification notification-error';
  notification.innerHTML = `
    <span>Произошла ошибка. Попробуйте обновить страницу.</span>
    <button onclick="this.parentElement.remove()">&times;</button>
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
  // Инициализируем корзину
  if (window.updateCartCounter) {
    updateCartCounter();
  }

  // Инициализируем кнопки добавления в корзину
  initializeAddToCartButtons();

  // Инициализируем поиск
  initializeSearch();

  // Инициализируем фильтры, если мы на странице каталога
  if (window.location.pathname === '/catalog') {
    initializeFilters();
  }

  // Обработчик глобальных ошибок
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', (e) => {
    handleGlobalError(e.reason);
  });
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initializeApp);

// Экспорт функций для использования в других файлах
window.getMockMangaData = getMockMangaData;
window.getMockMangaList = getMockMangaList;
window.clearFilters = clearFilters;
window.performSearch = performSearch;