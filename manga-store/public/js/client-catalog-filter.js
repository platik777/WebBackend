class ClientCatalogFilters {
  constructor() {
    this.allMangaCards = [];
    this.currentFilters = {
      genre: '',
      sort: '',
      stock: ''
    };

    this.initializeFilters();
    this.storeMangaCards();
  }

  // Сохраняем все карточки манги при загрузке страницы
  storeMangaCards() {
    const mangaContainer = document.querySelector('.manga-grid');
    if (mangaContainer) {
      this.allMangaCards = Array.from(mangaContainer.children);
    }
  }

  // Инициализация обработчиков фильтров
  initializeFilters() {
    const genreFilter = document.getElementById('genreFilter');
    const sortFilter = document.getElementById('sortFilter');
    const stockFilter = document.getElementById('stockFilter');

    if (genreFilter) {
      genreFilter.addEventListener('change', () => {
        this.currentFilters.genre = genreFilter.value;
        this.applyFilters();
      });
    }

    if (sortFilter) {
      sortFilter.addEventListener('change', () => {
        this.currentFilters.sort = sortFilter.value;
        this.applyFilters();
      });
    }

    if (stockFilter) {
      stockFilter.addEventListener('change', () => {
        this.currentFilters.stock = stockFilter.value;
        this.applyFilters();
      });
    }

    // Добавляем кнопку очистки фильтров
    this.addClearFiltersButton();
  }

  // Добавить кнопку очистки фильтров
  addClearFiltersButton() {
    const catalogFilters = document.querySelector('.catalog-filters');
    if (catalogFilters && !document.getElementById('clearFiltersBtn')) {
      const clearButton = document.createElement('button');
      clearButton.id = 'clearFiltersBtn';
      clearButton.type = 'button';
      clearButton.className = 'btn btn-secondary';
      clearButton.innerHTML = '<i class="fas fa-times"></i> Очистить фильтры';
      clearButton.style.cssText = `
        background: #f8f9fa;
        color: #6c757d;
        border: 2px solid #e9ecef;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 1rem;
      `;

      clearButton.addEventListener('click', () => {
        this.clearAllFilters();
      });

      clearButton.addEventListener('mouseenter', () => {
        clearButton.style.background = '#e9ecef';
        clearButton.style.borderColor = '#dee2e6';
      });

      clearButton.addEventListener('mouseleave', () => {
        clearButton.style.background = '#f8f9fa';
        clearButton.style.borderColor = '#e9ecef';
      });

      catalogFilters.appendChild(clearButton);
    }
  }

  // Применить все фильтры
  applyFilters() {
    let filteredCards = [...this.allMangaCards];

    // Фильтр по жанру
    if (this.currentFilters.genre) {
      filteredCards = filteredCards.filter(card => {
        const genreText = this.getMangaGenre(card);
        return genreText.toLowerCase().includes(this.currentFilters.genre.toLowerCase());
      });
    }

    // Фильтр по наличию
    if (this.currentFilters.stock) {
      filteredCards = filteredCards.filter(card => {
        const inStock = this.getMangaStock(card);
        if (this.currentFilters.stock === 'in-stock') {
          return inStock;
        } else if (this.currentFilters.stock === 'out-of-stock') {
          return !inStock;
        }
        return true;
      });
    }

    // Сортировка
    if (this.currentFilters.sort) {
      filteredCards = this.sortMangaCards(filteredCards, this.currentFilters.sort);
    }

    // Обновляем отображение
    this.updateMangaDisplay(filteredCards);
    this.updateResultsCount(filteredCards.length);

    // Показываем уведомление
    if (window.showCartNotification) {
      const hasFilters = Object.values(this.currentFilters).some(v => v !== '');
      if (hasFilters) {
        showCartNotification(`Найдено товаров: ${filteredCards.length}`, 'success');
      }
    }
  }

  // Получить жанр манги из карточки
  getMangaGenre(card) {
    const genreElement = card.querySelector('.manga-genre, .genre-text, [data-genre]');
    if (genreElement) {
      return genreElement.textContent?.trim() || genreElement.getAttribute('data-genre') || '';
    }

    // Пробуем найти в других местах
    const mangaInfo = card.querySelector('.manga-info, .manga-details');
    if (mangaInfo) {
      const text = mangaInfo.textContent || '';
      const genreMatch = text.match(/Жанр[:\s]*([^,\n]+)/i);
      if (genreMatch) return genreMatch[1].trim();
    }

    return '';
  }

  // Проверить наличие манги
  getMangaStock(card) {
    // Проверяем наличие класса или атрибута
    if (card.classList.contains('out-of-stock') || card.hasAttribute('data-out-of-stock')) {
      return false;
    }
    if (card.classList.contains('in-stock') || card.hasAttribute('data-in-stock')) {
      return true;
    }

    // Проверяем текст в карточке
    const stockElement = card.querySelector('.stock-status, .manga-stock, [data-stock]');
    if (stockElement) {
      const stockText = stockElement.textContent?.toLowerCase() || '';
      return !stockText.includes('нет в наличии') && !stockText.includes('недоступно');
    }

    // По умолчанию считаем, что товар есть в наличии
    return true;
  }

  // Получить цену манги
  getMangaPrice(card) {
    const priceElement = card.querySelector('.manga-price, .price, [data-price]');
    if (priceElement) {
      const priceText = priceElement.textContent || priceElement.getAttribute('data-price') || '0';
      const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
      return isNaN(price) ? 0 : price;
    }
    return 0;
  }

  // Получить название манги
  getMangaTitle(card) {
    const titleElement = card.querySelector('.manga-title, .title, h3, h4, [data-title]');
    if (titleElement) {
      return titleElement.textContent?.trim() || titleElement.getAttribute('data-title') || '';
    }
    return '';
  }

  // Получить автора манги
  getMangaAuthor(card) {
    const authorElement = card.querySelector('.manga-author, .author, [data-author]');
    if (authorElement) {
      return authorElement.textContent?.trim() || authorElement.getAttribute('data-author') || '';
    }

    // Пробуем найти в описании
    const mangaInfo = card.querySelector('.manga-info, .manga-details');
    if (mangaInfo) {
      const text = mangaInfo.textContent || '';
      const authorMatch = text.match(/Автор[:\s]*([^,\n]+)/i);
      if (authorMatch) return authorMatch[1].trim();
    }

    return '';
  }

  // Сортировка карточек манги
  sortMangaCards(cards, sortType) {
    const sortedCards = [...cards];

    switch (sortType) {
      case 'title-asc':
        return sortedCards.sort((a, b) =>
          this.getMangaTitle(a).localeCompare(this.getMangaTitle(b))
        );

      case 'title-desc':
        return sortedCards.sort((a, b) =>
          this.getMangaTitle(b).localeCompare(this.getMangaTitle(a))
        );

      case 'price-asc':
        return sortedCards.sort((a, b) =>
          this.getMangaPrice(a) - this.getMangaPrice(b)
        );

      case 'price-desc':
        return sortedCards.sort((a, b) =>
          this.getMangaPrice(b) - this.getMangaPrice(a)
        );

      case 'author-asc':
        return sortedCards.sort((a, b) =>
          this.getMangaAuthor(a).localeCompare(this.getMangaAuthor(b))
        );

      case 'author-desc':
        return sortedCards.sort((a, b) =>
          this.getMangaAuthor(b).localeCompare(this.getMangaAuthor(a))
        );

      default:
        return sortedCards;
    }
  }

  // Обновить отображение манги
  updateMangaDisplay(filteredCards) {
    const mangaContainer = document.querySelector('.manga-grid');
    const emptyState = document.querySelector('.empty-catalog');

    if (!mangaContainer) return;

    // Очищаем контейнер
    mangaContainer.innerHTML = '';

    // Скрываем пустое состояние если оно есть
    if (emptyState) {
      emptyState.style.display = 'none';
    }

    if (filteredCards.length === 0) {
      // Показываем сообщение о пустых результатах
      this.showEmptyResults();
    } else {
      // Добавляем отфильтрованные карточки
      filteredCards.forEach(card => {
        mangaContainer.appendChild(card);
      });

      // Переинициализируем кнопки корзины
      if (window.initializeAddToCartButtons) {
        window.initializeAddToCartButtons();
      }
    }
  }

  // Показать пустые результаты
  showEmptyResults() {
    const mangaContainer = document.querySelector('.manga-grid');
    if (!mangaContainer) return;

    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-results';
    emptyMessage.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: white; border-radius: 12px; margin: 1rem 0;">
        <i class="fas fa-search" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 1rem;"></i>
        <h3 style="color: #2c3e50; margin-bottom: 0.5rem;">Ничего не найдено</h3>
        <p style="color: #7f8c8d; margin-bottom: 1rem;">Попробуйте изменить параметры фильтрации</p>
        <button onclick="window.catalogFilters?.clearAllFilters()" class="btn btn-primary">Очистить фильтры</button>
      </div>
    `;

    mangaContainer.appendChild(emptyMessage);
  }

  // Обновить счетчик результатов
  updateResultsCount(count) {
    let resultsElement = document.querySelector('.filter-results');

    if (!resultsElement) {
      resultsElement = document.createElement('div');
      resultsElement.className = 'filter-results';
      resultsElement.style.cssText = 'margin-top: 1.5rem;';

      const catalogHeader = document.querySelector('.catalog-header');
      if (catalogHeader) {
        catalogHeader.appendChild(resultsElement);
      }
    }

    const hasActiveFilters = Object.values(this.currentFilters).some(value => value !== '');
    const totalCount = this.allMangaCards.length;

    if (hasActiveFilters) {
      resultsElement.innerHTML = `
        <div class="results-count" style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          text-align: center;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        ">
          Показано <strong style="color: #ffd700;">${count}</strong> из <strong style="color: #ffd700;">${totalCount}</strong> товаров
        </div>
      `;
      resultsElement.style.display = 'block';
    } else {
      resultsElement.style.display = 'none';
    }
  }

  // Очистить все фильтры
  clearAllFilters() {
    this.currentFilters = {
      genre: '',
      sort: '',
      stock: ''
    };

    // Сбрасываем значения в форме
    const genreFilter = document.getElementById('genreFilter');
    const sortFilter = document.getElementById('sortFilter');
    const stockFilter = document.getElementById('stockFilter');

    if (genreFilter) genreFilter.value = '';
    if (sortFilter) sortFilter.value = '';
    if (stockFilter) stockFilter.value = '';

    // Показываем все карточки
    this.updateMangaDisplay(this.allMangaCards);
    this.updateResultsCount(this.allMangaCards.length);

    if (window.showCartNotification) {
      showCartNotification('Фильтры очищены', 'info');
    }
  }

  // Обновить данные (если карточки добавились динамически)
  refreshMangaCards() {
    this.storeMangaCards();
    this.applyFilters();
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем, что мы на странице каталога
  if (document.querySelector('.catalog-filters') && document.querySelector('.manga-grid')) {
    // Небольшая задержка чтобы убедиться что все элементы загрузились
    setTimeout(() => {
      window.catalogFilters = new ClientCatalogFilters();
      console.log('Клиентская фильтрация инициализирована');
    }, 100);
  }
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClientCatalogFilters;
}