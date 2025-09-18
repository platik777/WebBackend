(function() {
  const pageLoadStart = performance.now();

  function displayTimingInfo() {
    const pageLoadEnd = performance.now();
    const clientTime = Math.round(pageLoadEnd - pageLoadStart);

    // Получаем время сервера из мета-тега или переменной
    const serverTimeElement = document.querySelector('meta[name="server-elapsed-time"]');
    const serverTime = serverTimeElement ?
      parseInt(serverTimeElement.getAttribute('content')) :
      (window.serverElapsedTime || null);

    // Создаем элемент для отображения времени
    const timingElement = document.createElement('div');
    timingElement.id = 'timing-info';
    timingElement.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      font-size: 12px;
      z-index: 10000;
      font-family: monospace;
    `;

    let timingText = `Клиент: ${clientTime}ms`;
    if (serverTime !== null) {
      timingText = `Сервер: ${serverTime}ms | ${timingText}`;
    }

    timingElement.innerHTML = timingText;

    // Добавляем элемент на страницу
    document.body.appendChild(timingElement);

    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
      if (timingElement && timingElement.parentNode) {
        timingElement.remove();
      }
    }, 5000);

    // Добавляем возможность скрыть по клику
    timingElement.addEventListener('click', () => {
      timingElement.remove();
    });
  }

  // Ждем полной загрузки страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', displayTimingInfo);
  } else {
    displayTimingInfo();
  }
})();