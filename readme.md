# Sentence Highlighter Chrome Extension

A Chrome extension that intelligently highlights sentences in any web page with soft, readable colors. The extension automatically adapts to both light and dark mode websites for optimal readability.

![Example Screenshot](screenshot.png)

## Features

- 🌈 Intelligent sentence highlighting with adaptive colors
- 🌓 Automatic dark/light mode detection
- 🎨 Soft color palettes optimized for readability
- ❌ Easy highlight removal with dismiss button
- 📱 Works across most modern websites
- 🔍 Preserves original text formatting
- 🎯 Context menu integration

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Select any text on a webpage
2. Right-click and choose "Highlight Sentences"
3. Each sentence will be highlighted with a different color
4. Hover over highlights to see the dismiss button (×)
5. Click the × to remove individual highlights
6. Use "Clear Highlights" from context menu to remove all highlights

## Technical Details

The extension uses:

- Chrome Extensions Manifest V3
- DOM TreeWalker for efficient text processing
- Automatic dark mode detection using luminance calculation
- Shadow DOM support for modern web apps
- Style preservation for consistent text formatting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Author

officiallynebula

Project Link: [https://github.com/officiallynebula/sentence-highlighter](https://github.com/officiallynebula/sentence-highlighter)
