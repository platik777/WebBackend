function getMockMangaData(id) {
  const mockData = {
    1: { title: 'Наруто', price: 599, imageUrl: '/images/naruto.jpg', inStock: true, author: 'Масаси Кисимото' },
    2: { title: 'Атака титанов', price: 699, imageUrl: '/images/aot.jpg', inStock: true, author: 'Хадзиме Исаяма' },
    3: { title: 'Ван Пис', price: 549, imageUrl: '/images/onepiece.jpg', inStock: false, author: 'Эйитиро Ода' },
    4: { title: 'Моя геройская академия', price: 579, imageUrl: '/images/mha.jpg', inStock: true, author: 'Кохэй Хорикоси' },
    5: { title: 'Берсерк', price: 799, imageUrl: '/images/berserk.jpg', inStock: true, author: 'Кэнтаро Миура' },
    6: { title: 'Магическая битва', price: 659, imageUrl: '/images/jjk.jpg', inStock: true, author: 'Гэгэ Акутами' },
    7: { title: 'Убийца демонов', price: 619, imageUrl: '/images/demon-slayer.jpg', inStock: true, author: 'Коёхару Готогэ' },
    8: { title: 'Мобильный воин Гандам', price: 729, imageUrl: '/images/gundam.jpg', inStock: true, author: 'Ёсиюки Томино' }
  };

  return mockData[id % 8 + 1];
}

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

// ИСПРАВЛЕННАЯ ФУНКЦИЯ: Добавить товар в корзину
function addToCart(mangaId, mangaData = null, quantity = 1) {
  const cart = getCart();
  const id = parseInt(mangaId);
  const existingItem = cart.find(item => item.id === id);

  // Получаем данные манги, если не переданы
  if (!mangaData) {
    mangaData = getMockMangaData(id);
  }

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: id,
      quantity: quantity,
      addedAt: new Date().toISOString()
    });
  }

  saveCart(cart);

  if (window.showCartNotification) {
    showCartNotification(`"${mangaData.title}" добавлен в корзину`, 'success');
  }
}

// Удалить товар из корзины
function removeFromCart(mangaId) {
  const cart = getCart();
  const filteredCart = cart.filter(item => item.id !== parseInt(mangaId));
  saveCart(filteredCart);

  if (window.location.pathname === '/cart') {
    loadCartItems();
  }

  if (window.showCartNotification) {
    showCartNotification('Товар удален из корзины', 'info');
  }
}

// Обновить количество товара
function updateCartQuantity(mangaId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === parseInt(mangaId));

  if (item) {
    if (quantity <= 0) {
      removeFromCart(mangaId);
    } else {
      item.quantity = parseInt(quantity);
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

  if (window.showCartNotification) {
    showCartNotification('Корзина очищена', 'success');
  }
}

// Получить общее количество товаров в корзине
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function updateCartCounter() {
  const totalItems = getCartTotal();
  const counter = document.querySelector('.cart-counter');

  if (counter) {
    counter.textContent = totalItems;

    if (totalItems > 0) {
      counter.style.display = 'flex';
      counter.classList.add('visible');

      if (totalItems > 9) {
        counter.classList.add('large-number');
      } else {
        counter.classList.remove('large-number');
      }

      counter.classList.add('pulse');
      setTimeout(() => {
        counter.classList.remove('pulse');
      }, 800);

    } else {
      counter.style.display = 'none';
      counter.classList.remove('visible', 'large-number');
    }
  }
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ: Загрузить товары корзины на странице
function loadCartItems() {
  const container = document.getElementById('cartItems');
  const cart = getCart();

  if (!container) return;

  if (cart.length === 0) {
    showEmptyCart();
    return;
  }

  // Получаем полные данные для каждого товара в корзине
  const cartWithDetails = cart.map(cartItem => {
    const mangaData = getMockMangaData(cartItem.id);
    return {
      id: cartItem.id,
      quantity: cartItem.quantity,
      title: mangaData.title,
      author: mangaData.author,
      price: mangaData.price,
      imageUrl: mangaData.imageUrl,
      inStock: mangaData.inStock
    };
  });

  container.innerHTML = `
    <div class="cart-items-list">
      ${cartWithDetails.map(item => `
        <div class="cart-item ${!item.inStock ? 'out-of-stock' : ''}">
          <div class="item-image">
            <img src="${item.imageUrl}" alt="${item.title}" />
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
            <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Удалить из корзины">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Обновляем итоги
  updateCartSummary(cartWithDetails);
}

// Показать пустую корзину
function showEmptyCart() {
  const container = document.getElementById('cartItems');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-cart">
      <i class="fas fa-shopping-cart empty-icon"></i>
      <h3>Корзина пуста</h3>
      <p>Добавьте товары из каталога для совершения покупки</p>
      <a href="/catalog" class="btn btn-primary">Перейти в каталог</a>
    </div>
  `;

  // Очищаем итоги
  const summaryElements = {
    itemsTotal: document.getElementById('itemsTotal'),
    shippingCost: document.getElementById('shippingCost'),
    totalAmount: document.getElementById('totalAmount'),
    checkoutBtn: document.getElementById('checkoutBtn')
  };

  Object.values(summaryElements).forEach(el => {
    if (el) {
      if (el.tagName === 'BUTTON') {
        el.disabled = true;
      } else {
        el.textContent = formatPrice(0);
      }
    }
  });
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ: Обновить итоги корзины
function updateCartSummary(items) {
  const itemsTotal = items.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    return sum + (price * quantity);
  }, 0);

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
  const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(numPrice);
}

// Перейти к оформлению заказа
function proceedToCheckout() {
  const cart = getCart();

  if (cart.length === 0) {
    if (window.showCartNotification) {
      showCartNotification('Корзина пуста', 'error');
    }
    return;
  }

  // Проверяем наличие товаров
  const cartWithDetails = cart.map(item => ({
    ...item,
    ...getMockMangaData(item.id)
  }));

  const unavailableItems = cartWithDetails.filter(item => !item.inStock);

  if (unavailableItems.length > 0) {
    if (window.showCartNotification) {
      showCartNotification('В корзине есть недоступные товары', 'error');
    }
    return;
  }

  // Переходим к оформлению заказа
  window.location.href = '/checkout';
}

function showCartNotification(message, type = 'info') {
  if (window.showCartNotification) {
    window.showCartNotification(message, type);
    return;
  }

  // Простая реализация уведомлений
  const notification = document.createElement('div');
  notification.className = `cart-notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem;
    background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
    color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
    border-radius: 8px;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

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
window.getMockMangaData = getMockMangaData;