#!/bin/bash

# Generate PDF from HTML using Chrome/Chromium headless mode
# This produces the highest quality PDF with proper formatting

HTML_FILE="NIVOSTACK_AWS_CREDITS_PITCH_DECK.html"
PDF_FILE="NIVOSTACK_AWS_CREDITS_PITCH_DECK.pdf"

# Find Chrome executable
CHROME=""
if [ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif command -v google-chrome &> /dev/null; then
    CHROME="google-chrome"
elif command -v chromium &> /dev/null; then
    CHROME="chromium"
elif command -v chromium-browser &> /dev/null; then
    CHROME="chromium-browser"
else
    echo "Error: Chrome/Chromium not found!"
    echo "Please install Google Chrome or use: brew install --cask google-chrome"
    exit 1
fi

# Get absolute path to HTML file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HTML_PATH="$SCRIPT_DIR/$HTML_FILE"
PDF_PATH="$SCRIPT_DIR/$PDF_FILE"

# Check if HTML file exists
if [ ! -f "$HTML_PATH" ]; then
    echo "Error: $HTML_FILE not found in $SCRIPT_DIR"
    exit 1
fi

echo "=========================================="
echo "NivoStack AWS Credits Pitch Deck - PDF Generator"
echo "=========================================="
echo ""
echo "Generating PDF from $HTML_FILE..."
echo "Using Chrome: $CHROME"
echo ""

# Generate PDF with Chrome headless mode
# Using better options for professional PDF output
# --print-to-pdf-no-header removes the file:// URL header
"$CHROME" \
    --headless \
    --disable-gpu \
    --run-all-compositor-stages-before-draw \
    --virtual-time-budget=5000 \
    --print-to-pdf="$PDF_PATH" \
    --print-to-pdf-no-header \
    --disable-print-preview \
    "file://$HTML_PATH" 2>/dev/null

if [ $? -eq 0 ] && [ -f "$PDF_PATH" ]; then
    PDF_SIZE=$(du -h "$PDF_PATH" | cut -f1)
    PDF_PAGES=$(mdls -name kMDItemNumberOfPages "$PDF_PATH" 2>/dev/null | grep -o '[0-9]*' || echo "unknown")
    
    echo "✓ Successfully generated PDF!"
    echo ""
    echo "  File: $PDF_FILE"
    echo "  Location: $PDF_PATH"
    echo "  Size: $PDF_SIZE"
    if [ "$PDF_PAGES" != "unknown" ]; then
        echo "  Pages: $PDF_PAGES"
    fi
    echo ""
    
    # Try to open the PDF (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Opening PDF in default viewer..."
        open "$PDF_PATH"
    else
        echo "PDF generated successfully. Open it manually to view."
    fi
else
    echo "✗ Failed to generate PDF"
    echo ""
    echo "Troubleshooting:"
    echo "1. Make sure Chrome/Chromium is installed"
    echo "2. Check that the HTML file exists: $HTML_PATH"
    echo "3. Try running Chrome manually to check for errors"
    exit 1
fi
