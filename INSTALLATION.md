# ScrollRate Installation Guide

## Quick Start (5 minutes)

### Step 1: Download or Clone
If you haven't already, make sure you have the ScrollRate extension folder on your computer.

### Step 2: Get Icons (Required)
The extension needs icon files to work properly. You have a few options:

**Option A - Quick Online Solution:**
1. Go to any free icon generator website
2. Search for "movie" or "rating" icons
3. Download the icons in sizes 16x16, 48x48, and 128x128
4. Save them as `icon16.png`, `icon48.png`, `icon128.png` in the `icons/` folder

**Option B - Use Temporary Icons:**
Create simple text-based icons:
1. Open any image editor (even MS Paint works)
2. Create a 16x16, 48x48, and 128x128 pixel image
3. Fill with a solid color and add "SR" text
4. Save as PNG files with the names above in the `icons/` folder

### Step 3: Get API Key (Recommended)
1. Visit [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)
2. Sign up for a free account
3. Copy your API key (you'll enter it later in the extension settings)

### Step 4: Load Extension in Chrome
1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar and press Enter
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Navigate to and select the `netflix-movie-rating-extension` folder
6. The extension should now appear in your extensions list

### Step 5: Configure Extension
1. Click the ScrollRate icon in your Chrome toolbar (you may need to pin it first)
2. Enter your OMDb API key if you have one
3. Toggle rating sources on/off (IMDb, Rotten Tomatoes)
4. Choose your preferred badge size

### Step 6: Test It Out!
1. Visit [Netflix.com](https://www.netflix.com) or any supported platform
2. Scroll through movies
3. You should see ratings appearing on movie thumbnails!

## Troubleshooting

### Extension Not Loading
- Make sure all files are in the correct folder structure
- Check that you've added the three icon PNG files
- Look for error messages in Chrome's extension management page

### Ratings Not Appearing
- Make sure you're on a supported platform (Netflix, Prime Video, etc.)
- Try refreshing the page
- Check the browser console for errors (F12 → Console)
- Verify your API key is entered correctly

### API Rate Limits
- If you see "Too many requests" errors, you may need to upgrade to a paid OMDb API plan
- Alternatively, wait a bit and try again
- The extension caches ratings for 24 hours to minimize API calls

## Supported Platforms

Current version supports:
- ✅ Netflix
- ✅ Amazon Prime Video
- ✅ IMDb
- ✅ Letterboxd
- ✅ Disney+
- ✅ Hulu

## Next Steps

1. **Customize Settings**: Click the extension icon to adjust your preferences
2. **Report Issues**: If something doesn't work, note the platform and describe the issue
3. **Suggest Features**: Share ideas for improvements!

Enjoy browsing with ratings! 🎬⭐

