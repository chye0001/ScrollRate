// Popup script for ScrollRate settings

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

function loadSettings() {
  chrome.storage.sync.get([
    'imdbEnabled',
    'rottenTomatoesEnabled',
    'badgeSize',
    'omdbApiKey',
    'darkModeEnabled',
    'badgeTransparency'
  ], (items) => {
    // Set toggle states
    document.getElementById('imdbEnabled').checked = items.imdbEnabled !== false;
    document.getElementById('rottenTomatoesEnabled').checked = items.rottenTomatoesEnabled !== false;
    
    // Set badge size
    const badgeSize = items.badgeSize || 'medium';
    const activeOption = document.querySelector(`.badge-size-option[data-size="${badgeSize}"]`);
    document.querySelectorAll('.badge-size-option').forEach(opt => opt.classList.remove('active'));
    activeOption?.classList.add('active');
    
    // Set transparency slider
    const transparency = items.badgeTransparency !== undefined ? items.badgeTransparency : 85;
    document.getElementById('transparencySlider').value = transparency;
    document.getElementById('transparencyValue').textContent = transparency + '%';
    
    // Set dark mode
    const darkMode = items.darkModeEnabled || false;
    document.getElementById('darkModeEnabled').checked = darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
    
    // Set API key
    if (items.omdbApiKey) {
      document.getElementById('apiKeyInput').value = items.omdbApiKey;
    }
  });
}

function setupEventListeners() {
  // Toggle listeners
  document.getElementById('imdbEnabled').addEventListener('change', (e) => {
    chrome.storage.sync.set({ imdbEnabled: e.target.checked });
    // showMessage('Settings saved!');
  });
  
  document.getElementById('rottenTomatoesEnabled').addEventListener('change', (e) => {
    chrome.storage.sync.set({ rottenTomatoesEnabled: e.target.checked });
    // showMessage('Settings saved!');
  });
  
  // Dark mode listener
  document.getElementById('darkModeEnabled').addEventListener('change', (e) => {
    chrome.storage.sync.set({ darkModeEnabled: e.target.checked });
    document.body.classList.toggle('dark-mode', e.target.checked);
    // showMessage('Settings saved!');
  });
  
  // Badge size listeners
  document.querySelectorAll('.badge-size-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.badge-size-option').forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      
      const size = option.getAttribute('data-size');
      chrome.storage.sync.set({ badgeSize: size });
      // showMessage('Settings saved!');
    });
  });
  
  // Transparency slider listener
  const transparencySlider = document.getElementById('transparencySlider');
  const transparencyValue = document.getElementById('transparencyValue');
  
  transparencySlider.addEventListener('input', (e) => {
    const value = e.target.value;
    transparencyValue.textContent = value + '%';
    chrome.storage.sync.set({ badgeTransparency: parseInt(value) });
  });
  

//-----------------------------------------------------------------------------------------
// API Key Section: Commented out for now as API key is already set in config.js 
// If you want to add it back, uncomment this section and the section in popup.html:404.
//-----------------------------------------------------------------------------------------

  // API key listener
  // let apiKeyTimeout;
  // document.getElementById('apiKeyInput').addEventListener('input', (e) => {
  //   clearTimeout(apiKeyTimeout);
  //   apiKeyTimeout = setTimeout(() => {
  //     const apiKey = e.target.value.trim();
  //     if (apiKey) {
  //       chrome.storage.sync.set({ omdbApiKey: apiKey });
  //       showMessage('API key saved!');
  //     }
  //   }, 500);
  // });
}

// function showMessage(text) {
//   const statusMessage = document.getElementById('statusMessage');
//   statusMessage.textContent = text;
//   statusMessage.classList.add('show');
  
//   setTimeout(() => {
//     statusMessage.classList.remove('show');
//   }, 2000);
// }

//-----------------------------------------------------------------------------------------
