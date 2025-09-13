function getCart() {
  try {
    return JSON.parse(localStorage.getItem('manga-cart') || '[]');
  } catch (error) {
    console.error('Ошибка при загрузке корзины:', error);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem('manga-cart', JSON.stringify(cart));
    updateCartCounter();
  } catch (error) {
    console.error('Ошибка при сохранении корзины:', error);
  }
}

function addToCart(mangaId, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === mangaId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    // Добавляем товар с базовой информацией
    cart.push({
      id: mangaId,
      quantity: quantity,
      // Дополнительные поля будут загружаться при отображении
      addedAt: new Date().toISOString()
    });
  }

  saveCart(cart);
  showNotification('Товар добавлен в корзину', 'success');
}

function removeFromCart(mangaId) {
  const cart = getCart();
  const filteredCart = cart.filter(item => item.id !== mangaId);
  saveCart(filteredCart);

  // Если мы на странице корзины, обновляем отображение
  if (window.location.pathname === '/cart') {
    loadCartItems();
  }
}

function updateCartQuantity(mangaId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === mangaId);

  if (item) {
    if (quantity <= 0) {
      removeFromCart(mangaId);
    } else {
      item.quantity = quantity;
      saveCart(cart);

      // Если мы на странице корзины, обновляем отображение
      if (window.location.pathname === '/cart') {
        loadCartItems();
      }
    }
  }
}

function clearCart() {
  localStorage.removeItem('manga-cart');
  updateCartCounter();

  if (window.location.pathname === '/cart') {
    loadCartItems();
  }

  showNotification('Корзина очищена', 'success');
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function updateCartCounter() {
  const totalItems = getCartTotal();
  const counter = document.querySelector('.cart-counter');

  if (counter) {
    counter.textContent = totalItems;
    counter.style.display = totalItems > 0 ? 'inline' : 'none';
  }
}

// Функции для страницы корзины
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

  // Загружаем информацию о товарах (мок-данные)
  const cartItemsWithDetails = await Promise.all(
    cart.map(async (item) => {
      // В реальном приложении здесь был бы запрос к API
      const mockManga = getMockMangaData(item.id);
      return {
        ...item,
        ...mockManga
      };
    })
  );

  renderCartItems(cartItemsWithDetails);
  updateCartSummary(cartItemsWithDetails);
}

function getMockMangaData(id) {
  // Мок-данные для товаров (в реальном приложении данные приходили бы с сервера)
  const mockData = {
    1: { title: 'Наруто', price: 599, imageUrl: '/images/naruto.jpg', inStock: true },
    2: { title: 'Атака титанов', price: 699, imageUrl: '/images/aot.jpg', inStock: true },
    3: { title: 'Ван Пис', price: 549, imageUrl: '/images/onepiece.jpg', inStock: false },
    4: { title: 'Моя геройская академия', price: 579, imageUrl: '/images/mha.jpg', inStock: true },
    5: { title: 'Берсерк', price: 799, imageUrl: '/images/berserk.jpg', inStock: true }
  };

  return mockData[id] || {
    title: 'Неизвестная манга',
    price: 500,
    imageUrl: '/images/placeholder.jpg',
    inStock: false
  };
}

function renderCartItems(items) {
  const container = document.getElementById('cartItems');
  if (!container) return;

  container.innerHTML = `
    <div class="cart-items-list">
      ${items.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <div class="item-image">
            <img src="${item.imageUrl}" alt="${item.title}" loading="lazy">
          </div>
          <div class="item-details">
            <h3 class="item-title">${item.title}</h3>
            <div class="item-status ${item.inStock ? 'in-stock' : 'out-of-stock'}">
              ${item.inStock ? '✓ В наличии' : '⚠ Нет в наличии'}
            </div>
            <div class="item-price">${formatPrice(item.price)}</div>
          </div>
          <div class="item-actions">
            <div class="quantity-controls">
              <button class="quantity-btn minus" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" 
                      ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
              <span class="quantity">${item.quantity}</span>
              <button class="quantity-btn plus" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})"
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

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(price);
}

// Функция для checkout (упрощенная)
function proceedToCheckout() {
  const cart = getCart();

  if (cart.length === 0) {
    showNotification('Корзина пуста', 'error');
    return;
  }

  // Проверяем наличие товаров
  const unavailableItems = cart.filter(item => {
    const mockData = getMockMangaData(item.id);
    return !mockData.inStock;
  });

  if (unavailableItems.length > 0) {
    showNotification('В корзине есть недоступные товары', 'error');
    return;
  }

  // В упрощенной версии просто показываем сообщение
  if (confirm('Перейти к оформлению заказа? (В упрощенной версии заказ не будет сохранен)')) {
    showNotification('Упрощенная версия: заказ оформлен!', 'success');
    clearCart();
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }
}

// Утилиты для уведомлений
function showNotification(message, type = 'info') {
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

// Глобальные функции для использования в HTML
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.clearCart = clearCart;