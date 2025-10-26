// Content Script for ScrollRate Extension

class MovieRatingRenderer {
  constructor() {
    this.ratingsCache = new Map();
    this.processedElements = new WeakSet();
    this.settings = {
      imdbEnabled: true,
      rottenTomatoesEnabled: true,
      badgeSize: 'medium',
      badgeTransparency: 85
    };
    this.init();
  }

  async init() {
    // Load settings
    await this.loadSettings();
    
    // Start observing the page
    this.observePage();
    
    // Listen for settings updates
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync') {
        let shouldUpdate = false;
        
        if ('imdbEnabled' in changes || 'rottenTomatoesEnabled' in changes || 'badgeSize' in changes || 'badgeTransparency' in changes) {
          shouldUpdate = true;
        }
        
        if (shouldUpdate) {
          this.loadSettings().then(() => {
            if ('badgeSize' in changes || 'badgeTransparency' in changes) {
              // Update existing badges dynamically
              this.updateExistingBadges();
            } else {
              // Re-process page with new settings
              this.processPage();
            }
          });
        }
      }
    });
    
    // Initial processing
    setTimeout(() => this.processPage(), 1000);
  }

  async loadSettings() {
    const data = await chrome.storage.sync.get(['imdbEnabled', 'rottenTomatoesEnabled', 'badgeSize', 'badgeTransparency']);
    this.settings.imdbEnabled = data.imdbEnabled !== false; // default true
    this.settings.rottenTomatoesEnabled = data.rottenTomatoesEnabled !== false; // default true
    this.settings.badgeSize = data.badgeSize || 'medium';
    this.settings.badgeTransparency = data.badgeTransparency !== undefined ? data.badgeTransparency : 85;
    
    // Apply transparency to all badges
    this.updateBadgeTransparency();
  }
  
  updateBadgeTransparency() {
    const badges = document.querySelectorAll('.scrollrate-badge');
    badges.forEach(badge => {
      const opacity = this.settings.badgeTransparency / 100;
      badge.style.opacity = opacity;
    });
  }
  
  updateExistingBadges() {
    // Update all existing badges on the page
    const badges = document.querySelectorAll('.scrollrate-badge');
    badges.forEach(badge => {
      // Remove old size classes
      badge.classList.remove('scrollrate-badge-small', 'scrollrate-badge-medium', 'scrollrate-badge-large');
      // Add new size class
      badge.classList.add('scrollrate-badge-' + this.settings.badgeSize);
      
      // Update transparency
      const opacity = this.settings.badgeTransparency / 100;
      badge.style.opacity = opacity;
    });
  }

  observePage() {
    // Use MutationObserver to watch for new content loaded dynamically
    const observer = new MutationObserver((mutations) => {
      let shouldProcess = false;
      
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && this.isMovieContainer(node)) {
              shouldProcess = true;
            }
          });
        }
      });
      
      if (shouldProcess) {
        setTimeout(() => this.processPage(), 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also listen for scroll events (Netflix and other platforms load content on scroll)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => this.processPage(), 1000);
    }, { passive: true });
  }

  isMovieContainer(element) {
    // Safely convert className to string (it can be a DOMTokenList or string)
    const className = element?.className 
      ? (typeof element.className === 'string' 
          ? element.className 
          : element.className.toString()).toLowerCase() 
      : '';
    const tagName = element?.tagName?.toLowerCase() || '';
    
    // Netflix patterns
    if (className.includes('billboard') || className.includes('slider') || 
        className.includes('title-card') || className.includes('title-card-container')) {
      return true;
    }
    
    // IMDB patterns
    if (className.includes('ipc-poster') || className.includes('ipc-title')) {
      return true;
    }
    
    // Amazon Prime patterns
    if (className.includes('av-hover-wrapper') || className.includes('title')) {
      return true;
    }
    
    // Generic movie/title indicators
    if (tagName === 'article' || tagName === 'section') {
      return true;
    }
    
    return false;
  }

  async processPage() {
    const movieElements = this.findMovieElements();
    
    for (const element of movieElements) {
      if (this.processedElements.has(element)) continue;
      
      const title = this.extractTitle(element);
      if (title) {
        this.processedElements.add(element);
        await this.addRatingBadge(element, title);
      }
    }
  }

  findMovieElements() {
    const selectors = [
      '.title-card-container', // Netflix
      '.slider-item', // Netflix
      '.billboard-row', // Netflix
      '[data-testid="title-card"]', // Netflix
      '.ipc-title', // IMDb
      '.ipc-poster-card', // IMDb
      '[class*="movie"]', // Generic
      '[class*="title"]' // Generic
    ];
    
    const elements = [];
    selectors.forEach(selector => {
      try {
        const found = document.querySelectorAll(selector);
        found.forEach(el => {
          if (!elements.includes(el)) elements.push(el);
        });
      } catch (e) {
        // Invalid selector
      }
    });
    
    return elements;
  }

  extractTitle(element) {
    // Try various strategies to find the movie title
    
    // Strategy 1: Look for aria-label or title attribute
    const titleAttr = element.getAttribute('aria-label') || element.getAttribute('title');
    if (titleAttr && !titleAttr.includes('http')) {
      return this.cleanTitle(titleAttr);
    }
    
    // Strategy 2: Look for common title elements
    const titleSelectors = [
      '.title',
      '.title-card-title',
      '.titleName',
      'h2',
      'h3',
      '[class*="title"]',
      '[class*="fallback-text"]'
    ];
    
    for (const selector of titleSelectors) {
      const titleEl = element.querySelector(selector);
      if (titleEl) {
        const text = titleEl.textContent?.trim();
        if (text && text.length > 0 && text.length < 200) {
          return this.cleanTitle(text);
        }
      }
    }
    
    // Strategy 3: Extract from img alt text
    const img = element.querySelector('img');
    if (img) {
      const alt = img.getAttribute('alt');
      if (alt && alt.length > 0 && alt.length < 200) {
        return this.cleanTitle(alt);
      }
    }
    
    // Strategy 4: Get text content from element itself
    const textContent = element.textContent?.trim();
    if (textContent && textContent.length > 0 && textContent.length < 200) {
      const lines = textContent.split('\n').filter(line => line.trim());
      for (const line of lines.slice(0, 3)) {
        const cleaned = this.cleanTitle(line);
        if (cleaned.length > 2) {
          return cleaned;
        }
      }
    }
    
    return null;
  }

  cleanTitle(title) {
    if (!title) return '';
    
    // Remove common suffixes and clean up
    title = title.trim();
    title = title.replace(/\s+/g, ' '); // Collapse whitespace
    title = title.replace(/[^\w\s\-\'":()]/g, ''); // Remove special chars
    
    // Remove common platform-specific text
    title = title.replace(/watch on imdb/gi, '');
    title = title.replace(/netflix/gi, '');
    title = title.replace(/prime video/gi, '');
    title = title.replace(/streaming now/gi, '');
    
    return title.trim();
  }

  async addRatingBadge(containerElement, title) {
    try {
      // Request rating from background script
      const response = await chrome.runtime.sendMessage({
        action: 'fetchRating',
        title: title
      });
      
      if (!response || !response.rating) {
        return; // No rating available
      }
      
      const rating = response.rating;
      
      // Create and inject badge
      const badge = this.createBadge(rating);
      this.injectBadge(containerElement, badge);
      
    } catch (error) {
      console.error('Error adding rating badge:', error);
    }
  }

  createBadge(rating) {
    const badge = document.createElement('div');
    badge.className = 'scrollrate-badge scrollrate-badge-' + this.settings.badgeSize;
    
    // Apply transparency
    const opacity = this.settings.badgeTransparency / 100;
    badge.style.opacity = opacity;
    
    let badgesHtml = '';
    
    if (this.settings.imdbEnabled && rating.imdb) {
      badgesHtml += `<span class="scrollrate-source imdb"><span class="scrollrate-label">IMDb</span> <span class="scrollrate-score">${rating.imdb}</span></span>`;
    }
    
    if (this.settings.rottenTomatoesEnabled && rating.rottenTomatoes) {
      badgesHtml += `<span class="scrollrate-source rt"><span class="scrollrate-label">RT</span> <span class="scrollrate-score">${rating.rottenTomatoes}%</span></span>`;
    }
    
    if (!badgesHtml) {
      return null; // No rating to display
    }
    
    badge.innerHTML = badgesHtml;
    badge.setAttribute('data-scrollrate', 'true');
    
    return badge;
  }

  injectBadge(containerElement, badge) {
    if (!badge) return;
    
    // Try to find a good position in the container
    const img = containerElement.querySelector('img');
    const poster = containerElement.querySelector('[class*="poster"], [class*="thumbnail"]');
    const target = poster || img || containerElement;
    
    // Check if badge already exists
    const existingBadge = containerElement.querySelector('.scrollrate-badge');
    if (existingBadge) {
      return;
    }
    
    // Find the best insertion point
    if (img && img.parentElement) {
      const parent = img.parentElement;
      if (parent.style.position !== 'static') {
        parent.style.position = 'relative';
        parent.appendChild(badge);
      } else {
        containerElement.appendChild(badge);
      }
    } else {
      containerElement.appendChild(badge);
    }
    
    // Ensure container has position relative
    if (getComputedStyle(containerElement).position === 'static') {
      containerElement.style.position = 'relative';
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MovieRatingRenderer();
  });
} else {
  new MovieRatingRenderer();
}

