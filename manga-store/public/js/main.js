document.addEventListener('DOMContentLoaded', function() {
  console.log('Manga Store initialized');

  initializeCart();
  initializeFilters();
  initializeNavigation();
  initializeProfileTabs();
  initializeReviewForm();
  initializeMangaCards();
  updateCartCounter();
});

// Initialize manga cards interactions
function initializeMangaCards() {
  // Обработка кликов по карточкам (для альтернативного способа перехода)
  const mangaCards = document.querySelectorAll('.manga-card');

  mangaCards.forEach(card => {
    // Добавляем курсор pointer для интерактивности
    card.style.cursor = 'pointer';

    // Переход на детальную страницу при клике на карточку (кроме кнопок)
    card.addEventListener('click', function(e) {
      // Проверяем, что клик не по кнопке или ссылке
      if (!e.target.closest('button') && !e.target.closest('a')) {
        const mangaId = this.getAttribute('data-manga-id') ||
          this.querySelector('[data-manga-id]')?.getAttribute('data-manga-id');
        if (mangaId) {
          window.location.href = `/manga/${mangaId}`;
        }
      }
    });
  });

  // Обработка кнопок "Подробнее"
  const detailButtons = document.querySelectorAll('.manga-detail-btn');
  detailButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // Предотвращаем всплытие события
    });
  });
}

// API Configuration
const API_BASE_URL = '';  // В продакшене здесь будет полный URL

// API Helper functions
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Manga API functions
async function getMangaList(filters = {}) {
  const queryParams = new URLSearchParams(filters).toString();
  return apiRequest(`/manga${queryParams ? '?' + queryParams : ''}`);
}

async function getMangaById(id) {
  return apiRequest(`/manga/${id}`);
}

async function getFeaturedManga() {
  return apiRequest('/manga/featured');
}

// Reviews API functions
async function getReviewsByMangaId(mangaId) {
  return apiRequest(`/reviews/manga/${mangaId}`);
}

async function createReview(reviewData) {
  return apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
  });
}

// Orders API functions
async function createOrder(orderData) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
}

async function getUserOrders(userId) {
  return apiRequest(`/orders/user/${userId}`);
}

// Users API functions
async function createUser(userData) {
  return apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

async function updateUser(userId, userData) {
  return apiRequest(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(userData)
  });
}

// Cart functionality
function initializeCart() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');

  addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const mangaId = this.getAttribute('data-manga-id');
      addToCart(mangaId);
    });
  });
}

function addToCart(mangaId) {
  let cart = JSON.parse(localStorage.getItem('manga-cart') || '[]');

  const existingItem = cart.find(item => item.id === mangaId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: mangaId, quantity: 1 });
  }

  localStorage.setItem('manga-cart', JSON.stringify(cart));

  showNotification('Товар добавлен в корзину!', 'success');
  updateCartCounter();
}

function removeFromCart(mangaId) {
  let cart = JSON.parse(localStorage.getItem('manga-cart') || '[]');
  cart = cart.filter(item => item.id !== mangaId);
  localStorage.setItem('manga-cart', JSON.stringify(cart));

  updateCartCounter();
  showNotification('Товар удален из корзины', 'info');
}

function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('manga-cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const counter = document.querySelector('.cart-counter');
  if (counter) {
    counter.textContent = totalItems;
    counter.style.display = totalItems > 0 ? 'inline' : 'none';
  }

  // Обновляем кнопку в корзине
  const cartButton = document.querySelector('.cart-button');
  if (cartButton) {
    cartButton.innerHTML = `
      <i class="fas fa-shopping-cart"></i>
      <span class="cart-text">Корзина</span>
      ${totalItems > 0 ? `<span class="cart-counter">${totalItems}</span>` : ''}
    `;
  }
}

function clearCart() {
  localStorage.removeItem('manga-cart');
  updateCartCounter();
}

// Filters functionality
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
        (stock === 'in-stock' && card.dataset.stock === '1') ||
        (stock === 'out-of-stock' && card.dataset.stock === '0');
      return matchesGenre && matchesStock;
    });

    if (sort) {
      const [by, order] = sort.split('-');
      filteredCards.sort((a, b) => {
        let valA = by === 'price' ? parseFloat(a.dataset.price) : a.dataset[by]?.toLowerCase();
        let valB = by === 'price' ? parseFloat(b.dataset.price) : b.dataset[by]?.toLowerCase();
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    cards.forEach(card => card.classList.add('hidden'));
    filteredCards.forEach(card => card.classList.remove('hidden'));

    filteredCards.forEach(card => container.appendChild(card));

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
    } else {
      const msg = document.createElement('div');
      msg.className = 'filter-results results-count';
      msg.textContent = `Найдено товаров: ${count}`;
      container.insertBefore(msg, container.firstChild);
    }
  }

  ['genreFilter', 'stockFilter', 'sortFilter'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', applyFiltersAndSort);
    }
  });

  applyFiltersAndSort();
}

function clearFilters() {
  ['genreFilter', 'stockFilter', 'sortFilter'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = '';
  });

  const container = document.getElementById('mangaContainer');
  if (container) {
    const cards = container.querySelectorAll('.manga-card');
    cards.forEach(card => card.classList.remove('hidden'));

    const filterResults = container.querySelector('.filter-results');
    if (filterResults) filterResults.remove();
  }
}

// Navigation functionality
function initializeNavigation() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.style.backgroundColor = 'rgba(255,255,255,0.2)';
    }
  });

  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  }
}

// Profile tabs functionality
function initializeProfileTabs() {
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  navTabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();

      const targetTab = this.getAttribute('data-tab');

      // Remove active class from all tabs and contents
      navTabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked tab and corresponding content
      this.classList.add('active');
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// Review form functionality
function initializeReviewForm() {
  const reviewForm = document.getElementById('reviewForm');
  if (!reviewForm) return;

  reviewForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    await submitReview();
  });
}

async function submitReview() {
  const form = document.getElementById('reviewForm');
  const formData = new FormData(form);

  const reviewData = {
    rating: parseInt(formData.get('rating')),
    comment: formData.get('comment') || null,
    userId: getCurrentUserId(), // Нужно получать из сессии/токена
    mangaId: getMangaIdFromPage()
  };

  if (!reviewData.rating) {
    showNotification('Пожалуйста, поставьте оценку', 'error');
    return;
  }

  try {
    await createReview(reviewData);
    showNotification('Отзыв добавлен!', 'success');
    form.reset();
    // Обновить список отзывов
    await loadReviews(reviewData.mangaId);
  } catch (error) {
    showNotification('Ошибка при добавлении отзыва', 'error');
  }
}

// User authentication helpers
function getCurrentUserId() {
  const user = JSON.parse(localStorage.getItem('mangastore_user') || '{}');
  return user.id || null;
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('mangastore_user') || 'null');
}

function isAuthenticated() {
  return getCurrentUser() !== null;
}

function logout() {
  localStorage.removeItem('mangastore_user');
  showNotification('Вы вышли из системы', 'info');
  setTimeout(() => {
    window.location.href = '/';
  }, 1000);
}

// Utility functions
function getMangaIdFromPage() {
  const pathParts = window.location.pathname.split('/');
  if (pathParts[1] === 'manga' && pathParts[2]) {
    return parseInt(pathParts[2]);
  }
  return null;
}

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(price);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Load reviews for manga detail page
async function loadReviews(mangaId) {
  try {
    const reviews = await getReviewsByMangaId(mangaId);
    updateReviewsDisplay(reviews);
  } catch (error) {
    console.error('Failed to load reviews:', error);
  }
}

function updateReviewsDisplay(reviews) {
  const reviewsList = document.querySelector('.reviews-list');
  if (!reviewsList) return;

  if (reviews.length === 0) {
    reviewsList.innerHTML = `
      <div class="no-reviews">
        <p>Пока нет отзывов на эту мангу. Будьте первым!</p>
      </div>
    `;
    return;
  }

  reviewsList.innerHTML = reviews.map(review => `
    <div class="review-item">
      <div class="review-header">
        <div class="review-author">${review.user.firstName} ${review.user.lastName}</div>
        <div class="review-rating">
          ${generateStars(review.rating)}
        </div>
        <div class="review-date">${formatDate(review.createdAt)}</div>
      </div>
      ${review.comment ? `<div class="review-comment">${review.comment}</div>` : ''}
    </div>
  `).join('');
}

function generateStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '<span class="star filled">★</span>';
    } else {
      stars += '<span class="star">★</span>';
    }
  }
  return stars;
}

// Notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);

  // Manual close
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  });
}

// Search functionality
function initializeSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-btn');

  if (searchInput && searchBtn) {
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
}

function performSearch() {
  const searchInput = document.querySelector('.search-input');
  const query = searchInput?.value.trim();

  if (!query) {
    showNotification('Введите поисковый запрос', 'warning');
    return;
  }

  window.location.href = `/catalog?search=${encodeURIComponent(query)}`;
}

// Wishlist functionality
function toggleWishlist(mangaId) {
  if (!isAuthenticated()) {
    showNotification('Войдите в систему, чтобы добавить в избранное', 'warning');
    return;
  }

  let wishlist = JSON.parse(localStorage.getItem('manga-wishlist') || '[]');

  if (wishlist.includes(mangaId)) {
    wishlist = wishlist.filter(id => id !== mangaId);
    showNotification('Удалено из избранного', 'info');
  } else {
    wishlist.push(mangaId);
    showNotification('Добавлено в избранное', 'success');
  }

  localStorage.setItem('manga-wishlist', JSON.stringify(wishlist));
  updateWishlistButton(mangaId);
}

function updateWishlistButton(mangaId) {
  const wishlist = JSON.parse(localStorage.getItem('manga-wishlist') || '[]');
  const wishlistBtn = document.querySelector(`[data-manga-id="${mangaId}"].wishlist-btn`);

  if (wishlistBtn) {
    if (wishlist.includes(mangaId)) {
      wishlistBtn.classList.add('active');
      wishlistBtn.innerHTML = '<i class="fas fa-heart"></i> В избранном';
    } else {
      wishlistBtn.classList.remove('active');
      wishlistBtn.innerHTML = '<i class="far fa-heart"></i> В избранное';
    }
  }
}

// Initialize wishlist buttons on page load
document.addEventListener('DOMContentLoaded', function() {
  const wishlistBtns = document.querySelectorAll('.wishlist-btn');
  wishlistBtns.forEach(btn => {
    const mangaId = btn.getAttribute('data-manga-id');
    updateWishlistButton(mangaId);
    btn.addEventListener('click', () => toggleWishlist(mangaId));
  });
});

// Lazy loading for images
function initializeLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeSearch();
  initializeLazyLoading();

  // Load manga data if on detail page
  const mangaId = getMangaIdFromPage();
  if (mangaId) {
    loadReviews(mangaId);
  }
});

// Global error handler
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
  showNotification('Произошла ошибка. Попробуйте обновить страницу.', 'error');
});

// Service Worker registration for PWA features
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('SW registered: ', registration);
      })
      .catch(function(registrationError) {
        console.log('SW registration failed: ', registrationError);
      });
  });
}