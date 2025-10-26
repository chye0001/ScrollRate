# ScrollRate - Chrome Extension

> Automatically displays movie ratings from IMDb and Rotten Tomatoes while browsing streaming platforms.

ScrollRate enhances your movie browsing experience by showing ratings directly on pages like Netflix, Amazon Prime Video, IMDb, Letterboxd, and more.

## Features

- **Automatic Rating Display**: Ratings appear automatically as you scroll through movies
- **Multiple Rating Sources**: Support for IMDb and Rotten Tomatoes scores
- **Customizable Badges**: Adjustable badge sizes (Small, Medium, Large)
- **Smart Caching**: Cached ratings to minimize API calls and improve performance
- **Non-Intrusive**: Ratings appear as elegant badges that don't block content
- **Privacy-Focused**: No personal data collection

## Installation

### From Source

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd netflix-movie-rating-extension
   ```

2. **Get an OMDb API Key** (optional but recommended)
   - Visit [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)
   - Sign up for a free API key
   - Copy your API key

3. **Load the Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked"
   - Select the `netflix-movie-rating-extension` folder

4. **Configure API Key** (optional)
   - Click the ScrollRate icon in your Chrome toolbar
   - Enter your OMDb API key in the settings panel
   - Click "Save"

5. **Add Extension Icons**
   - Create an `icons` folder in the extension directory
   - Add three PNG images:
     - `icon16.png` (16x16 pixels)
     - `icon48.png` (48x48 pixels)
     - `icon128.png` (128x128 pixels)
   - You can use any movie/rating related icon

## Usage

1. **Browse Streaming Platforms**: Visit Netflix, Prime Video, or other supported platforms
2. **Scroll Through Movies**: Scroll through the movie listings
3. **View Ratings**: Ratings automatically appear on movie thumbnails as badges
4. **Customize Settings**: Click the extension icon to adjust:
   - Toggle rating sources (IMDb, Rotten Tomatoes)
   - Adjust badge size (Small, Medium, Large)
   - Add your API key for better performance

## Supported Platforms

- Netflix
- Amazon Prime Video
- IMDb
- Letterboxd
- Disney+
- Hulu
- And more generic movie listing pages

## Configuration

### Rating Sources
Toggle which rating sources you want to display:
- **IMDb**: Shows out of 10 rating
- **Rotten Tomatoes**: Shows percentage score

### Badge Sizes
Choose the size that works best for your browsing experience:
- **Small**: Minimal, unobtrusive badges
- **Medium**: Balanced size (default)
- **Large**: Maximum visibility

### API Key
While the extension works without an API key (using a default shared key), getting your own free key provides:
- Better rate limits
- More reliable access
- Better performance

## Architecture

- **`manifest.json`**: Chrome extension configuration
- **`background.js`**: Service worker handling API calls and caching
- **`content.js`**: Main script that detects movies and injects badges
- **`styles.css`**: Badge styling and animations
- **`popup.html/js`**: Settings panel UI

### Key Technologies

- **Chrome Extension API v3**
- **OMDb API** for rating data
- **Local Storage** for caching and settings
- **MutationObserver** for dynamic content detection

## Development

### Project Structure
```
netflix-movie-rating-extension/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js             # Content script for page injection
├── styles.css             # Badge styles
├── popup.html             # Settings popup
├── popup.js               # Settings popup logic
├── icons/                 # Extension icons (you need to add these)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Testing Locally

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the reload icon on the ScrollRate extension
4. Test on supported websites

### Debugging

- **Background Script**: Check `chrome://extensions/` → ScrollRate → "Inspect views: background page"
- **Content Script**: Right-click on the page → "Inspect" → Console
- **Popup**: Click extension icon → Right-click → "Inspect"

## Performance

The extension is optimized for performance:
- **Smart Caching**: Ratings are cached for 24 hours
- **Lazy Loading**: Only processes visible content
- **Efficient API Calls**: Batched and cached requests
- **Minimal DOM Impact**: Lightweight badge injection

## Known Limitations

- Requires OMDb API key for best results (free tier available)
- Ratings may not be available for very new or obscure titles
- Some complex page layouts may not be fully supported

## Contributing

Contributions are welcome! Areas for improvement:
- Support for additional rating sources
- Better movie title detection
- More platform support
- Enhanced caching strategies

## License

MIT License - Feel free to use and modify as needed.

## Support

For issues, feature requests, or questions, please open an issue in the repository.

## Changelog

### v1.0.0 (Initial Release)
- IMDb and Rotten Tomatoes rating support
- Automatic badge injection
- Configurable settings
- Smart caching system
- Support for major streaming platforms

