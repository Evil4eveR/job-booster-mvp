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
      if (view) {
        if (viewId === activeViewId) {
          view.classList.remove('hidden');
        } else {
          view.classList.add('hidden');
        }
      }
    });
  },

  /**
   * Render dynamic target keywords into structured indigo micro-badges
   * @param {Array<string>} keywords 
   */
  renderKeywords(keywords) {
    const container = document.getElementById('preview-keywords-tags');
    if (!container) return;
    
    container.innerHTML = ''; // Flush out any stale data
    
    if (!keywords || keywords.length === 0) {
      container.innerHTML = `<span class="text-xs text-slate-500 italic">No keywords parsed.</span>`;
      return;
    }

    keywords.forEach(keyword => {
      const badge = document.createElement('span');
      // Uniform micro-badges with deep padding and a clean border frame accent
      badge.className = 'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono tracking-wide shadow-sm animate-fade-in';
      badge.textContent = keyword.trim();
      container.appendChild(badge);
    });
  },

  /**
   * Transforms raw analysis lines into an organized, high-density checklist
   * @param {Array<string>|string} guidelines 
   */
  renderATSBullets(guidelines) {
    const container = document.getElementById('preview-ats-bullets');
    if (!container) return;

    container.innerHTML = ''; // Flush old content

    // Normalize guidelines to an array if passed as a multi-line string block
    const items = Array.isArray(guidelines) 
      ? guidelines 
      : (guidelines ? guidelines.split('\n').filter(line => line.trim()) : []);

    if (items.length === 0) {
      container.innerHTML = `<li class="text-xs text-slate-500 italic">No tracking criteria specified.</li>`;
      return;
    }

    items.forEach(item => {
      // Strips markdown list markers (like "-" or "*") if they bleed through from the LLM
      const cleanedText = item.replace(/^[\s-*•]+/, '').trim();
      
      const li = document.createElement('li');
      // Implements a clean vertical list layout with an inline checklist icon framework
      li.className = 'text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 shadow-sm flex items-start space-x-2.5 animate-fade-in';
      li.innerHTML = `
        <span class="text-indigo-400 font-bold select-none mt-0.5">→</span>
        <span class="flex-1">${cleanedText}</span>
      `;
      container.appendChild(li);
    });
  }
};