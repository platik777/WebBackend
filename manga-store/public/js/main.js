document.addEventListener('DOMContentLoaded', function() {
  console.log('Manga Store initialized');

  initializeCart();
  initializeFilters();
  initializeNavigation();
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
  const genreFilter = document.getElementById('genreFilter');
  const sortFilter = document.getElementById('sortFilter');
  const stockFilter = document.getElementById('stockFilter');

  if (genreFilter) {
    genreFilter.addEventListener('change', filterMangas);
  }
  if (sortFilter) {
    sortFilter.addEventListener('change', filterMangas);
  }
  if (stockFilter) {
    stockFilter.addEventListener('change', filterMangas);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('mangaContainer');
  if (!container) return;

  const cards = Array.from(container.querySelectorAll('.manga-card'));

  function applyFilters() {
    const genre = document.getElementById('genreFilter').value;
    const stock = document.getElementById('stockFilter').value;

    cards.forEach(card => {
      const matchesGenre = !genre || card.dataset.genre.includes(genre);
      const matchesStock =
        !stock ||
        (stock === 'in-stock' && card.dataset.stock === '1') ||
        (stock === 'out-of-stock' && card.dataset.stock === '0');
      card.style.display = matchesGenre && matchesStock ? 'block' : 'none';
    });
  }

  function applySort() {
    const sort = document.getElementById('sortFilter').value;
    const [by, order] = sort.split('-');

    const sorted = cards
      .filter(card => card.style.display !== 'none')
      .sort((a, b) => {
        let valA = by === 'price' ? parseFloat(a.dataset.price) : a.dataset[by].toLowerCase();
        let valB = by === 'price' ? parseFloat(b.dataset.price) : b.dataset[by].toLowerCase();
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });

    sorted.forEach(card => container.appendChild(card));
  }

  ['genreFilter', 'stockFilter'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      applyFilters();
      applySort();
    });
  });

  document.getElementById('sortFilter').addEventListener('change', applySort);

  applyFilters();
  applySort();
});



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

  // Auto remove after 3 seconds
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

document.addEventListener('DOMContentLoaded', updateCartCounter);