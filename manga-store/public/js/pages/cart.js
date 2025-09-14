// Получить корзину из localStorage
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('manga-cart') || '[]');
  } catch (error) {
    console.error('Ошибка при загрузке корзины:', error);
    return [];
  }
}

// Сохранить корзину в localStorage
function saveCart(cart) {
  try {
    localStorage.setItem('manga-cart', JSON.stringify(cart));
    updateCartCounter();
  } catch (error) {
    console.error('Ошибка при сохранении корзины:', error);
  }
}

// Добавить товар в корзину
function addToCart(mangaId, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === parseInt(mangaId));

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: parseInt(mangaId),
      quantity: quantity,
      addedAt: new Date().toISOString()
    });
  }

  saveCart(cart);
  showNotification('Товар добавлен в корзину', 'success');
}

// Удалить товар из корзины
function removeFromCart(mangaId) {
  const cart = getCart();
  const filteredCart = cart.filter(item => item.id !== parseInt(mangaId));
  saveCart(filteredCart);

  if (window.location.pathname === '/cart') {
    loadCartItems();
  }

  showNotification('Товар удален из корзины', 'info');
}

// Обновить количество товара
function updateCartQuantity(mangaId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === parseInt(mangaId));

  if (item) {
    if (quantity <= 0) {
      removeFromCart(mangaId);
    } else {
      item.quantity = quantity;
      saveCart(cart);

      if (window.location.pathname === '/cart') {
        loadCartItems();
      }
    }
  }
}

// Очистить корзину
function clearCart() {
  localStorage.removeItem('manga-cart');
  updateCartCounter();

  if (window.location.pathname === '/cart') {
    loadCartItems();
  }

  showNotification('Корзина очищена', 'success');
}

// Получить общее количество товаров в корзине
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// Обновить счетчик корзины в навигации
function updateCartCounter() {
  const totalItems = getCartTotal();
  const counter = document.querySelector('.cart-counter');

  if (counter) {
    counter.textContent = totalItems;
    counter.style.display = totalItems > 0 ? 'inline' : 'none';
  }
}

// Получить мок-данные для товара
function getMockMangaData(id) {
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

  return mockData[id % 8 + 1];
}

// Загрузить товары корзины на странице
async function loadCartItems() {
  const cartItemsContainer = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const cart = getCart();

  if (cart.length === 0) {
    if (cartItemsContainer) cartItemsContainer.style.display = 'none';
    if (emptyCart) emptyCart.style.display = 'block';
    updateCartSummary([]);
    return;
  }

  if (cartItemsContainer) cartItemsContainer.style.display = 'block';
  if (emptyCart) emptyCart.style.display = 'none';

  // Загружаем информацию о товарах с мок-данными
  const cartItemsWithDetails = cart.map(item => {
    const mockManga = getMockMangaData(item.id);
    return {
      ...item,
      ...mockManga
    };
  });

  renderCartItems(cartItemsWithDetails);
  updateCartSummary(cartItemsWithDetails);
}

// Отрендерить товары в корзине
function renderCartItems(items) {
  const container = document.getElementById('cartItems');
  if (!container) return;

  container.innerHTML = `
    <div class="cart-items-list">
      ${items.map(item => `
        <div class="cart-item ${!item.inStock ? 'unavailable' : ''}" data-id="${item.id}">
          <div class="item-image">
            <img src="${item.imageUrl}" alt="${item.title}" loading="lazy">
            ${!item.inStock ? `
              <div class="stock-overlay">
                <span class="stock-status">Нет в наличии</span>
              </div>
            ` : ''}
          </div>
          <div class="item-details">
            <h3 class="item-title">${item.title}</h3>
            ${item.author ? `<p class="item-author">${item.author}</p>` : ''}
            <div class="item-status ${item.inStock ? 'in-stock' : 'out-of-stock'}">
              ${item.inStock ? '✓ В наличии' : '⚠ Нет в наличии'}
            </div>
            <div class="item-price">${formatPrice(item.price)}</div>
          </div>
          <div class="item-actions">
            <div class="quantity-controls">
              <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" 
                      ${item.quantity <= 1 || !item.inStock ? 'disabled' : ''}>-</button>
              <span class="quantity">${item.quantity}</span>
              <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})"
                      ${!item.inStock ? 'disabled' : ''}>+</button>
            </div>
            <div class="item-total">${formatPrice(item.price * item.quantity)}</div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Обновить итоги корзины
function updateCartSummary(items) {
  const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = itemsTotal >= 1000 ? 0 : 200; // Бесплатная доставка от 1000₽
  const totalAmount = itemsTotal + shippingCost;

  const elements = {
    itemsTotal: document.getElementById('itemsTotal'),
    shippingCost: document.getElementById('shippingCost'),
    totalAmount: document.getElementById('totalAmount'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    deliveryInfo: document.getElementById('deliveryInfo')
  };

  if (elements.itemsTotal) elements.itemsTotal.textContent = formatPrice(itemsTotal);
  if (elements.shippingCost) elements.shippingCost.textContent = shippingCost === 0 ? 'Бесплатно' : formatPrice(shippingCost);
  if (elements.totalAmount) elements.totalAmount.textContent = formatPrice(totalAmount);

  if (elements.checkoutBtn) {
    elements.checkoutBtn.disabled = items.length === 0;
  }

  if (elements.deliveryInfo) {
    elements.deliveryInfo.style.display = items.length > 0 ? 'block' : 'none';
  }
}

// Форматировать цену
function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(price);
}

// Перейти к оформлению заказа
function proceedToCheckout() {
  const cart = getCart();

  if (cart.length === 0) {
    showNotification('Корзина пуста', 'error');
    return;
  }

  // Проверяем наличие товаров
  const cartWithDetails = cart.map(item => ({
    ...item,
    ...getMockMangaData(item.id)
  }));

  const unavailableItems = cartWithDetails.filter(item => !item.inStock);

  if (unavailableItems.length > 0) {
    showNotification('В корзине есть недоступные товары', 'error');
    return;
  }

  // В упрощенной версии просто показываем сообщение
  if (confirm('Перейти к оформлению заказа?\n(В упрощенной версии заказ не будет сохранен)')) {
    showNotification('Упрощенная версия: заказ оформлен!', 'success');
    clearCart();
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }
}

// Показать уведомление
function showNotification(message, type = 'info') {
  // Удаляем существующие уведомления
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">&times;</button>
  `;

  document.body.appendChild(notification);

  // Автоматически убираем уведомление через 3 секунды
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  updateCartCounter();

  // Если мы на странице корзины, загружаем товары
  if (window.location.pathname === '/cart') {
    loadCartItems();

    // Добавляем обработчики для кнопок
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите очистить корзину?')) {
          clearCart();
        }
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', proceedToCheckout);
    }
  }
});

// Экспорт функций для использования в других файлах
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.clearCart = clearCart;
window.getCart = getCart;
window.updateCartCounter = updateCartCounter;