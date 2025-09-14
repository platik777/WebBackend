let orderData = null;

// Загрузить товары для оформления заказа
function loadOrderItems() {
  const cart = getCart();
  const orderItemsContainer = document.getElementById('orderItems');

  if (cart.length === 0) {
    window.location.href = '/cart';
    return;
  }

  if (!orderItemsContainer) return;

  // Получаем детали товаров из мок-данных
  const itemsWithDetails = cart.map(item => {
    const details = getMockMangaData(item.id);
    return {
      ...item,
      ...details
    };
  });

  // Фильтруем только доступные товары
  const availableItems = itemsWithDetails.filter(item => item.inStock);

  if (availableItems.length === 0) {
    showCheckoutNotification('В корзине нет доступных товаров', 'error');
    setTimeout(() => {
      window.location.href = '/cart';
    }, 2000);
    return;
  }

  // Рендерим товары
  orderItemsContainer.innerHTML = availableItems.map(item => `
    <div class="order-item">
      <img src="${item.imageUrl}" alt="${item.title}" class="order-item-image">
      <div class="order-item-details">
        <h4>${item.title}</h4>
        <p>Количество: ${item.quantity}</p>
        <p class="order-item-price">${formatPrice(item.price * item.quantity)}</p>
      </div>
    </div>
  `).join('');

  // Обновляем итоги
  updateOrderTotals(availableItems);

  // Сохраняем данные для заказа
  orderData = availableItems;
}

// Обновить итоги заказа
function updateOrderTotals(items) {
  const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = itemsTotal >= 1000 ? 0 : 200;
  const totalAmount = itemsTotal + shippingCost;

  const elements = {
    itemsTotal: document.getElementById('itemsTotal'),
    shippingCost: document.getElementById('shippingCost'),
    totalAmount: document.getElementById('totalAmount')
  };

  if (elements.itemsTotal) {
    elements.itemsTotal.textContent = formatPrice(itemsTotal);
  }

  if (elements.shippingCost) {
    elements.shippingCost.textContent = shippingCost === 0 ? 'Бесплатно' : formatPrice(shippingCost);
  }

  if (elements.totalAmount) {
    elements.totalAmount.textContent = formatPrice(totalAmount);
  }
}

// Применить промокод
function applyCoupon() {
  const couponInput = document.getElementById('couponCode');
  const couponResult = document.getElementById('couponResult');
  const couponCode = couponInput.value.trim().toUpperCase();

  if (!couponCode) {
    showCouponResult('Введите промокод', 'error');
    return;
  }

  // Мок-промокоды для демонстрации
  const validCoupons = {
    'MANGA10': { discount: 10, type: 'percent' },
    'WELCOME': { discount: 100, type: 'fixed' },
    'SAVE20': { discount: 20, type: 'percent' }
  };

  const coupon = validCoupons[couponCode];

  if (coupon) {
    const discountText = coupon.type === 'percent'
      ? `${coupon.discount}%`
      : `${coupon.discount} ₽`;

    showCouponResult(`Промокод применен! Скидка: ${discountText}`, 'success');

    // В реальном приложении здесь бы пересчитывались итоги с учетом скидки
    // updateOrderTotals(orderData, coupon);
  } else {
    showCouponResult('Неверный промокод', 'error');
  }
}

// Показать результат применения купона
function showCouponResult(message, type) {
  const couponResult = document.getElementById('couponResult');
  if (!couponResult) return;

  couponResult.innerHTML = message;
  couponResult.className = `coupon-result ${type}`;
  couponResult.style.display = 'block';
}

// Валидация формы
function validateCheckoutForm(formData) {
  const errors = [];

  // Проверяем обязательные поля
  if (!formData.get('email')) {
    errors.push('Email обязателен для заполнения');
  } else if (!isValidEmail(formData.get('email'))) {
    errors.push('Введите корректный email');
  }

  if (!formData.get('firstName')) {
    errors.push('Имя обязательно для заполнения');
  }

  if (!formData.get('lastName')) {
    errors.push('Фамилия обязательна для заполнения');
  }

  if (!formData.get('phone')) {
    errors.push('Телефон обязателен для заполнения');
  }

  if (!formData.get('city')) {
    errors.push('Город обязателен для заполнения');
  }

  if (!formData.get('address')) {
    errors.push('Адрес обязателен для заполнения');
  }

  return errors;
}

// Проверка корректности email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Обработать оформление заказа
function processOrder(formData) {
  const orderDetails = {
    items: orderData,
    customer: {
      email: formData.get('email'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone')
    },
    shipping: {
      city: formData.get('city'),
      address: formData.get('address'),
      postalCode: formData.get('postalCode'),
      floor: formData.get('floor')
    },
    payment: {
      method: formData.get('paymentMethod')
    },
    notes: formData.get('notes'),
    createdAt: new Date().toISOString(),
    orderId: generateOrderId()
  };

  // В реальном приложении здесь был бы запрос к серверу
  // Сохраняем в localStorage для демонстрации
  const orders = JSON.parse(localStorage.getItem('user-orders') || '[]');
  orders.push(orderDetails);
  localStorage.setItem('user-orders', JSON.stringify(orders));

  return orderDetails;
}

// Генерация ID заказа
function generateOrderId() {
  return 'ORDER-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Показать модальное окно успешного заказа
function showSuccessModal(orderDetails) {
  const modal = document.getElementById('successModal');
  const orderNumberElement = document.getElementById('orderNumber');

  if (orderNumberElement) {
    orderNumberElement.textContent = orderDetails.orderId;
  }

  if (modal) {
    modal.style.display = 'flex';
  }
}

// Перейти к деталям заказа
function goToOrderDetails() {
  // В реальном приложении здесь был бы переход к странице заказа
  showCheckoutNotification('Переход к деталям заказа...', 'info');
  setTimeout(() => {
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
  existingNotifications.forEach(notification => notification.remove());

  const notification = document.createElement('div');
  notification.className = `checkout-notification notification-${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">&times;</button>
  `;

  const checkoutPage = document.querySelector('.checkout-page');
  if (checkoutPage) {
    checkoutPage.insertBefore(notification, checkoutPage.firstChild);
  } else {
    document.body.appendChild(notification);
  }

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Маска для поля телефона
function applyPhoneMask(input) {
  let value = input.value.replace(/\D/g, '');

  if (value.startsWith('8')) {
    value = '7' + value.substring(1);
  }

  if (value.startsWith('7')) {
    value = value.substring(0, 11);
    const formatted = value.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
    input.value = formatted;
  } else if (value.length > 0) {
    input.value = '+7 (' + value;
  }
}

// Инициализация формы
function initializeCheckoutForm() {
  const checkoutForm = document.getElementById('checkoutForm');
  if (!checkoutForm) return;

  // Обработчик отправки формы
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = checkoutForm.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    // Показываем загрузку
    if (btnText) btnText.style.opacity = '0';
    if (btnSpinner) btnSpinner.style.display = 'block';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(checkoutForm);

      // Валидация
      const errors = validateCheckoutForm(formData);
      if (errors.length > 0) {
        showCheckoutNotification(errors.join('\n'), 'error');
        return;
      }

      // Проверяем наличие товаров
      if (!orderData || orderData.length === 0) {
        showCheckoutNotification('Корзина пуста', 'error');
        return;
      }

      // Имитируем задержку обработки
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Обрабатываем заказ
      const orderDetails = processOrder(formData);

      // Очищаем корзину
      localStorage.removeItem('manga-cart');
      if (window.updateCartCounter) {
        updateCartCounter();
      }

      // Показываем успешное сообщение
      showSuccessModal(orderDetails);

    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      showCheckoutNotification('Произошла ошибка при оформлении заказа', 'error');
    } finally {
      // Скрываем загрузку
      if (btnText) btnText.style.opacity = '1';
      if (btnSpinner) btnSpinner.style.display = 'none';
      submitBtn.disabled = false;
    }
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