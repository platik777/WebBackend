document.addEventListener('DOMContentLoaded', function() {
  console.log('Manga Store initialized');

  initializeCart();
  initializeFilters();
  initializeNavigation();
  updateCartCounter();
});

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

function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('manga-cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const counter = document.querySelector('.cart-counter');
  if (counter) {
    counter.textContent = totalItems;
    counter.style.display = totalItems > 0 ? 'inline' : 'none';
  }
}

function initializeFilters() {
  const container = document.getElementById('mangaContainer');
  if (!container) return;

  const cards = Array.from(container.querySelectorAll('.manga-card'));

  function applyFiltersAndSort() {
    const genre = document.getElementById('genreFilter').value;
    const stock = document.getElementById('stockFilter').value;
    const sort = document.getElementById('sortFilter').value;

    let filteredCards = cards.filter(card => {
      const matchesGenre = !genre || card.dataset.genre.includes(genre);
      const matchesStock =
        !stock ||
        (stock === 'in-stock' && card.dataset.stock === '1') ||
        (stock === 'out-of-stock' && card.dataset.stock === '0');
      return matchesGenre && matchesStock;
    });

    if (sort) {
      const [by, order] = sort.split('-');
      filteredCards.sort((a, b) => {
        let valA = by === 'price' ? parseFloat(a.dataset.price) : a.dataset[by].toLowerCase();
        let valB = by === 'price' ? parseFloat(b.dataset.price) : b.dataset[by].toLowerCase();
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    cards.forEach(card => card.classList.add('hidden'));
    filteredCards.forEach(card => card.classList.remove('hidden'));

    filteredCards.forEach(card => container.appendChild(card));

    if (filteredCards.length === 0) {
      if (!document.querySelector('.empty-message')) {
        const msg = document.createElement('p');
        msg.className = 'empty-message';
        msg.textContent = 'Нет товаров по выбранным фильтрам';
        container.appendChild(msg);
      }
    } else {
      const emptyMsg = document.querySelector('.empty-message');
      if (emptyMsg) emptyMsg.remove();
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



function initializeNavigation() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.style.backgroundColor = 'rgba(255,255,255,0.2)';
    }
  });
}


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

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);

  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  });
}
