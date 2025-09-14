// Интегрированная версия checkout.js с реальными API вызовами

let orderData = [];

// Загрузка товаров в заказе при загрузке страницы
function loadOrderItems() {
  const cart = getCart();

  if (!cart || cart.length === 0) {
    showEmptyCart();
    return;
  }

  orderData = cart.map(cartItem => {
    const mockData = getMockMangaData(cartItem.id);
    return {
      id: cartItem.id,
      quantity: cartItem.quantity,
      title: mockData.title,
      author: mockData.author,
      price: mockData.price,
      image: mockData.imageUrl,
      total: mockData.price * cartItem.quantity
    };
  });

  renderOrderItems();
  updateOrderSummary();
}

// Отображение товаров в заказе
function renderOrderItems() {
  const container = document.getElementById('orderItems');
  if (!container) return;

  container.innerHTML = orderData.map(item => `
    <div class="order-item">
      <img src="${item.image}" alt="${item.title}" class="item-image">
      <div class="item-details">
        <div class="item-title">${item.title}</div>
        <div class="item-author">${item.author}</div>
        <div class="item-quantity">Количество: ${item.quantity}</div>
      </div>
      <div class="item-price">${formatPrice(item.total)}</div>
    </div>
  `).join('');
}

// Обновление сводки заказа
function updateOrderSummary() {
  const subtotal = orderData.reduce((sum, item) => sum + item.total, 0);
  const shipping = subtotal >= 1000 ? 0 : 300;
  const total = subtotal + shipping;

  const subtotalEl = document.getElementById('subtotal');
  const shippingEl = document.getElementById('shipping');
  const totalEl = document.getElementById('total');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Бесплатно' : formatPrice(shipping);
  if (totalEl) totalEl.textContent = formatPrice(total);
}

// Показать пустую корзину
function showEmptyCart() {
  const container = document.getElementById('orderItems');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-order">
      <i class="fas fa-shopping-cart"></i>
      <h3>Корзина пуста</h3>
      <p>Добавьте товары для оформления заказа</p>
      <a href="/catalog" class="btn btn-primary">Перейти в каталог</a>
    </div>
  `;

  const submitBtn = document.getElementById('submitOrder');
  if (submitBtn) submitBtn.disabled = true;
}

// Инициализация формы оформления заказа
function initializeCheckoutForm() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSubmitOrder(e.target);
  });

  // Маска для телефона
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      applyPhoneMask(e.target);
    });
  }

  // Обработчик применения купона
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', applyCoupon);
  }

  // Обработчики модального окна
  const goToOrderDetailsBtn = document.getElementById('goToOrderDetailsBtn');
  const continueShoppingBtn = document.getElementById('continueShoppingBtn');

  if (goToOrderDetailsBtn) {
    goToOrderDetailsBtn.addEventListener('click', goToOrderDetails);
  }

  if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener('click', continueShopping);
  }

  // Закрытие модального окна по клику на фон
  const successModal = document.getElementById('successModal');
  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.style.display = 'none';
        continueShopping();
      }
    });
  }
}

// ОСНОВНАЯ ФУНКЦИЯ ИНТЕГРАЦИИ: Обработка отправки заказа
async function handleSubmitOrder(form) {
  const formData = new FormData(form);
  const submitBtn = document.getElementById('submitOrder');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');

  // Валидация
  if (!validateCheckoutForm(formData)) {
    return;
  }

  const cart = getCart();
  if (!cart || cart.length === 0) {
    showCheckoutNotification('Корзина пуста', 'error');
    return;
  }

  // Показать загрузку
  submitBtn.disabled = true;
  if (btnText) btnText.style.opacity = '0.7';
  if (btnSpinner) btnSpinner.style.display = 'inline-block';

  try {
    // Подготовка данных для API
    const orderData = {
      userId: null, // Гостевой заказ (нет авторизации)
      customerEmail: formData.get('email'),
      customerFirstName: formData.get('firstName'),
      customerLastName: formData.get('lastName'),
      shippingAddress: formData.get('address'),
      shippingCity: formData.get('city'),
      shippingPhone: formData.get('phone'),
      paymentMethod: formData.get('paymentMethod') || 'card',
      items: cart.map(item => {
        const mockData = getMockMangaData(item.id);
        return {
          mangaId: item.id,
          quantity: item.quantity,
          price: mockData.price
        };
      })
    };

    console.log('Отправляем заказ:', orderData);

    // РЕАЛЬНЫЙ API ЗАПРОС К БЭКЕНДУ
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при создании заказа');
    }

    const createdOrder = await response.json();
    console.log('Заказ создан:', createdOrder);

    // Очистить корзину при успешном заказе
    localStorage.removeItem('manga-cart');
    if (window.updateCartCounter) {
      window.updateCartCounter();
    }

    // Показать модальное окно успеха
    showSuccessModal({
      orderId: createdOrder.orderNumber,
      totalAmount: createdOrder.totalAmount
    });

    showCheckoutNotification('Заказ успешно оформлен!', 'success');

  } catch (error) {
    console.error('Ошибка оформления заказа:', error);
    showCheckoutNotification(
      error.message || 'Произошла ошибка при оформлении заказа. Попробуйте снова.',
      'error'
    );
  } finally {
    // Скрыть загрузку
    if (btnText) btnText.style.opacity = '1';
    if (btnSpinner) btnSpinner.style.display = 'none';
    submitBtn.disabled = false;
  }
}

// Валидация формы оформления заказа
function validateCheckoutForm(formData) {
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'city', 'address'];
  let isValid = true;

  // Очистить предыдущие ошибки
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });

  // Проверка обязательных полей
  requiredFields.forEach(fieldName => {
    const value = formData.get(fieldName);
    if (!value || !value.toString().trim()) {
      showFieldError(fieldName, 'Это поле обязательно');
      isValid = false;
    }
  });

  // Проверка email
  const email = formData.get('email');
  if (email && !isValidEmail(email)) {
    showFieldError('email', 'Введите корректный email');
    isValid = false;
  }

  // Проверка телефона
  const phone = formData.get('phone');
  if (phone && phone.toString().replace(/\D/g, '').length < 10) {
    showFieldError('phone', 'Введите корректный номер телефона');
    isValid = false;
  }

  return isValid;
}

// Показать ошибку поля
function showFieldError(fieldName, message) {
  const field = document.querySelector(`[name="${fieldName}"]`);
  if (field) {
    field.classList.add('error');
    const errorEl = field.parentElement.querySelector('.error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }
}

// Применить маску телефона
function applyPhoneMask(input) {
  let value = input.value.replace(/\D/g, '');

  if (value.length > 0) {
    if (value[0] === '8') value = '7' + value.slice(1);
    if (value[0] !== '7') value = '7' + value;
  }

  if (value.length >= 11) {
    value = value.slice(0, 11);
  }

  let formatted = value;
  if (value.length > 1) {
    formatted = `+7 (${value.slice(1, 4)}`;
    if (value.length > 4) {
      formatted += `) ${value.slice(4, 7)}`;
      if (value.length > 7) {
        formatted += `-${value.slice(7, 9)}`;
        if (value.length > 9) {
          formatted += `-${value.slice(9, 11)}`;
        }
      }
    }
  }

  input.value = formatted;
}

// Применить купон (заглушка)
function applyCoupon() {
  const couponInput = document.getElementById('couponCode');
  const couponCode = couponInput?.value?.trim();

  if (!couponCode) {
    showCheckoutNotification('Введите код купона', 'warning');
    return;
  }

  // Простая имитация купонов
  const validCoupons = {
    'FIRST10': { discount: 0.1, description: 'Скидка 10% на первый заказ' },
    'SAVE500': { discount: 500, description: 'Скидка 500 рублей' }
  };

  if (validCoupons[couponCode]) {
    const coupon = validCoupons[couponCode];
    showCheckoutNotification(`Купон применен: ${coupon.description}`, 'success');
    // В реальном приложении здесь бы пересчитывалась сумма заказа
  } else {
    showCheckoutNotification('Неверный код купона', 'error');
  }
}

// Проверка корректности email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Показать модальное окно успешного заказа
function showSuccessModal(orderDetails) {
  const modal = document.getElementById('successModal');
  const orderNumberElement = document.getElementById('orderNumber');

  if (orderNumberElement && orderDetails.orderId) {
    orderNumberElement.textContent = orderDetails.orderId;
  }

  if (modal) {
    modal.style.display = 'flex';
  }
}

// Перейти к деталям заказа
function goToOrderDetails() {
  showCheckoutNotification('Переход к деталям заказа...', 'info');
  setTimeout(() => {
    // В реальном приложении здесь был бы переход к конкретному заказу
    window.location.href = '/orders';
  }, 1000);
}

// Продолжить покупки
function continueShopping() {
  window.location.href = '/catalog';
}

// Показать уведомление на странице checkout
function showCheckoutNotification(message, type = 'info') {
  const existingNotifications = document.querySelectorAll('.checkout-notification');
  existingNotifications.forEach(n => n.remove());

  const notification = document.createElement('div');
  notification.className = `checkout-notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Получить функции корзины из cart.js
function getCart() {
  if (window.getCart) {
    return window.getCart();
  }

  try {
    return JSON.parse(localStorage.getItem('manga-cart') || '[]');
  } catch (error) {
    console.error('Ошибка при загрузке корзины:', error);
    return [];
  }
}

// Получить мок-данные (дублируем из cart.js для независимости)
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

  return mockData[id] || {
    title: 'Неизвестная манга',
    price: 500,
    imageUrl: '/images/placeholder.jpg',
    inStock: false,
    author: 'Неизвестный автор'
  };
}

// Форматирование цены (дублируем из cart.js)
function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(price);
}

// Обновить счетчик корзины
function updateCartCounter() {
  if (window.updateCartCounter) {
    window.updateCartCounter();
  }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/checkout') {
    loadOrderItems();
    initializeCheckoutForm();
  }
});

// Экспорт функций для использования в HTML
window.applyCoupon = applyCoupon;
window.goToOrderDetails = goToOrderDetails;
window.continueShopping = continueShopping;