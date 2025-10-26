// Background Service Worker for ScrollRate Extension

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Load API key from config.js (for local development)
// Falls back to user's stored key or empty string
let OMDB_API_KEY = '';

// Try to load from config.js (only works in development environment)
// In production, users will provide their own key via popup settings

// Initialize default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    imdbEnabled: true,
    rottenTomatoesEnabled: true,
    badgeSize: 'medium',
    badgeTransparency: 85,
    darkModeEnabled: false,
    lastCleanup: Date.now()
  });
});

// Fetch movie rating from OMDb API (provides IMDb and Rotten Tomatoes scores)
async function fetchMovieRating(title, year = null) {
  try {
    // Get API key from storage
    const data = await chrome.storage.sync.get(['omdbApiKey']);
    const apiKey = data.omdbApiKey || OMDB_API_KEY;
    
    // Check cache first
    const cacheKey = `rating_${title}_${year || 'unknown'}`;
    const cached = await getFromCache(cacheKey);
    
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    
    // Build API URL
    let url = `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(title)}&r=json`;
    if (year) {
      url += `&y=${year}`;
    }
    
    const response = await fetch(url);
    const apiData = await response.json();
    
    if (apiData.Response === 'False') {
      return null;
    }
    
    // Extract ratings
    const rtRating = apiData.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value;
    const imdbRating = apiData.Ratings?.find(r => r.Source === 'Internet Movie Database')?.Value;
    
    const ratings = {
      title: apiData.Title,
      year: apiData.Year,
      imdb: imdbRating?.replace('/10', '').trim() || null,
      rottenTomatoes: rtRating?.replace('%', '').trim() || null,
      metacritic: apiData.Ratings?.find(r => r.Source === 'Metacritic')?.Value || null,
      poster: apiData.Poster !== 'N/A' ? apiData.Poster : null
    };
    
    // Cache the result
    await setCache(cacheKey, ratings);
    
    return ratings;
  } catch (error) {
    console.error('Error fetching movie rating:', error);
    return null;
  }
}

// Cache management
async function getFromCache(key) {
  const data = await chrome.storage.local.get([key]);
  return data[key];
}

async function setCache(key, value) {
  const cacheEntry = {
    data: value,
    expiry: Date.now() + CACHE_DURATION
  };
  await chrome.storage.local.set({ [key]: cacheEntry });
}

// Clean old cache entries periodically
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchRating') {
    fetchMovieRating(request.title, request.year)
      .then(rating => sendResponse({ rating }))
      .catch(error => {
        console.error('Error:', error);
        sendResponse({ rating: null });
      });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'cleanCache') {
    cleanOldCacheEntries();
  }
});

// Clean up old cache entries
async function cleanOldCacheEntries() {
  try {
    const allData = await chrome.storage.local.get(null);
    const now = Date.now();
    let cleaned = 0;
    
    for (const key in allData) {
      if (key.startsWith('rating_')) {
        const entry = allData[key];
        if (entry.expiry && entry.expiry < now) {
          await chrome.storage.local.remove(key);
          cleaned++;
        }
      }
    }
    
    console.log(`Cleaned ${cleaned} expired cache entries`);
    
    // Check if we should clean up again
    const data = await chrome.storage.sync.get(['lastCleanup']);
    const lastCleanup = data.lastCleanup || 0;
    
    if (now - lastCleanup > 7 * 24 * 60 * 60 * 1000) { // Every 7 days
      await chrome.storage.sync.set({ lastCleanup: now });
    }
  } catch (error) {
    console.error('Error cleaning cache:', error);
  }
}

// Periodic cache cleanup
chrome.alarms.create('cleanCache', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanCache') {
    cleanOldCacheEntries();
  }
});

