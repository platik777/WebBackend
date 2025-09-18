(function() {
  const navigationStart = performance.timing?.navigationStart || performance.timeOrigin || Date.now();

  function displayTimingInfo() {
    const currentTime = performance.now();

    const timing = performance.timing;
    let clientTime;

    if (timing) {
      clientTime = Math.round(timing.domContentLoadedEventEnd - timing.navigationStart);

      if (clientTime <= 0 || !timing.domContentLoadedEventEnd) {
        clientTime = Math.round(currentTime);
      }
    } else {
      clientTime = Math.round(currentTime);
    }

    const serverTimeElement = document.querySelector('meta[name="server-elapsed-time"]');
    const serverTime = serverTimeElement ?
      parseInt(serverTimeElement.getAttribute('content')) :
      (window.serverElapsedTime || null);

    console.log('Server time from meta/window:', serverTime);

    const timingElement = document.createElement('div');
    timingElement.id = 'timing-info';
    timingElement.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      z-index: 10000;
      font-family: 'Courier New', monospace;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.1);
    `;

    let timingText = `Клиент: ${clientTime}ms`;
    if (serverTime !== null && serverTime > 0) {
      timingText = `Сервер: ${serverTime}ms | ${timingText}`;
    }

    if (timing && timing.loadEventEnd > 0) {
      const totalLoadTime = Math.round(timing.loadEventEnd - timing.navigationStart);
      timingText += ` | Полная загрузка: ${totalLoadTime}ms`;
    }

    timingElement.innerHTML = timingText;

    const existingElement = document.getElementById('timing-info');
    if (existingElement) {
      existingElement.remove();
    }

    document.body.appendChild(timingElement);

    setTimeout(() => {
      if (timingElement && timingElement.parentNode) {
        timingElement.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => {
          if (timingElement.parentNode) {
            timingElement.remove();
          }
        }, 500);
      }
    }, 7000);

    timingElement.addEventListener('click', () => {
      timingElement.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        if (timingElement.parentNode) {
          timingElement.remove();
        }
      }, 300);
    });

    if (!document.querySelector('#timing-animations')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'timing-animations';
      styleSheet.textContent = `
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(10px); }
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }

  function initializeTiming() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        // Небольшая задержка, чтобы браузер успел обновить timing
        setTimeout(displayTimingInfo, 10);
      });

      window.addEventListener('load', () => {
        setTimeout(() => {
          displayTimingInfo();
        }, 100);
      });
    } else if (document.readyState === 'interactive') {
      setTimeout(displayTimingInfo, 10);
    } else {
      displayTimingInfo();
    }
  }

  initializeTiming();
})();