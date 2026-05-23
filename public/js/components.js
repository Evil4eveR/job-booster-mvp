const Components = {
  showNotification(message, type = 'info') {
    const zone = document.getElementById('notification-zone');
    if (!zone) return;

    const notification = document.createElement('div');
    notification.className = `p-4 rounded-xl shadow-lg border text-sm transition duration-300 font-medium pointer-events-auto flex justify-between items-center w-80 animate-fade-in ${
      type === 'error' 
        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    }`;
    
    notification.innerHTML = `<span>${message}</span>`;
    zone.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  },

  toggleView(activeViewId) {
    ['input-view', 'loading-view', 'results-view'].forEach(viewId => {
      const view = document.getElementById(viewId);
      if (viewId === activeViewId) {
        view.classList.remove('hidden');
      } else {
        view.classList.add('hidden');
      }
    });
  }
};