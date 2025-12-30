# NivoStack AWS Credits Pitch Deck - PDF Generation Guide

This guide explains how to generate a professional PDF from the NivoStack AWS Credits Pitch Deck.

## Files Available

1. **NIVOSTACK_AWS_CREDITS_PITCH_DECK.md** - Markdown source file
2. **NIVOSTACK_AWS_CREDITS_PITCH_DECK.html** - HTML version (ready for PDF conversion)
3. **generate_pdf_pitch_deck.py** - Python script for automated PDF generation

## Method 1: Automated Chrome Script (Best Quality - Recommended) ⭐

**This is the fastest and produces the highest quality PDF!**

Simply run:
```bash
cd docs/business
./generate_pdf_chrome.sh
```

The script will:
- Automatically detect Chrome/Chromium
- Generate a professional PDF with proper formatting
- Open the PDF automatically (on macOS)

**Requirements:**
- Google Chrome or Chromium installed
- No additional dependencies needed

**Output:**
- File: `NIVOSTACK_AWS_CREDITS_PITCH_DECK.pdf`
- Size: ~400KB
- Pages: 8 pages
- Quality: Professional, print-ready

---

## Method 2: Browser Print to PDF (Manual)

This is the simplest manual method:

1. **Open the HTML file in your browser:**
   ```bash
   open docs/business/NIVOSTACK_AWS_CREDITS_PITCH_DECK.html
   ```
   Or double-click the HTML file to open it in your default browser.

2. **Print to PDF:**
   - Press `Cmd+P` (Mac) or `Ctrl+P` (Windows/Linux)
   - Select "Save as PDF" or "Microsoft Print to PDF"
   - Choose "More settings" and ensure:
     - Margins: Default or Minimum
     - Background graphics: Enabled
     - Scale: 100%
   - Click "Save" and choose location

3. **Result:** Professional PDF with proper formatting, colors, and page breaks.

## Method 2: Online Converters

### Option A: Markdown to PDF
1. Go to https://www.markdowntopdf.com/
2. Upload `NIVOSTACK_AWS_CREDITS_PITCH_DECK.md`
3. Download the PDF

### Option B: HTML to PDF
1. Go to https://www.ilovepdf.com/html-to-pdf
2. Upload `NIVOSTACK_AWS_CREDITS_PITCH_DECK.html`
3. Download the PDF

### Option C: Dillinger
1. Go to https://dillinger.io/
2. Copy content from `NIVOSTACK_AWS_CREDITS_PITCH_DECK.md`
3. Click "Export as" → PDF
4. Download

## Method 3: Python Script (Automated)

### Prerequisites

Install required libraries:

```bash
# Install Python dependencies
pip3 install markdown weasyprint

# For macOS, also install system dependencies
brew install cairo pango gdk-pixbuf libffi
```

### Generate PDF

```bash
cd docs/business
python3 generate_pdf_pitch_deck.py
```

The script will try multiple methods and create `NIVOSTACK_AWS_CREDITS_PITCH_DECK.pdf`.

## Method 4: Pandoc (Command Line)

If you have pandoc installed:

```bash
cd docs/business

# Convert markdown to PDF
pandoc NIVOSTACK_AWS_CREDITS_PITCH_DECK.md -o NIVOSTACK_AWS_CREDITS_PITCH_DECK.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=1in \
  -V fontsize=11pt \
  --toc
```

## Method 5: VS Code Extension

If you use VS Code:

1. Install "Markdown PDF" extension
2. Open `NIVOSTACK_AWS_CREDITS_PITCH_DECK.md`
3. Right-click → "Markdown PDF: Export (pdf)"
4. PDF will be generated in the same directory

## Recommended Approach

**For best results, use Method 1 (Browser Print to PDF):**
- ✅ No installation required
- ✅ Perfect formatting and colors
- ✅ Professional appearance
- ✅ Works on any platform
- ✅ Full control over page breaks

## File Locations

After generation, you should have:
- `docs/business/NIVOSTACK_AWS_CREDITS_PITCH_DECK.md` (source)
- `docs/business/NIVOSTACK_AWS_CREDITS_PITCH_DECK.html` (HTML version)
- `docs/business/NIVOSTACK_AWS_CREDITS_PITCH_DECK.pdf` (final PDF)

## Tips for Professional PDF

1. **Page Breaks:** The HTML version includes CSS for proper page breaks. If using markdown directly, you may need to adjust.

2. **Colors:** The HTML version uses professional blue color scheme. Browser print will preserve these colors.

3. **Tables:** All tables are formatted with proper borders and alternating row colors.

4. **Headers:** Headers are styled with different colors and sizes for hierarchy.

5. **Print Settings:** When printing from browser:
   - Enable "Background graphics" to show colors
   - Use "Letter" size (8.5" x 11")
   - Set margins to 1 inch
   - Scale to 100%

## Troubleshooting

**Issue:** PDF looks different from HTML
- **Solution:** Use browser print method (Method 1) for best results

**Issue:** Colors not showing
- **Solution:** Enable "Background graphics" in print settings

**Issue:** Page breaks in wrong places
- **Solution:** The HTML includes CSS for page breaks. Use browser print method.

**Issue:** Tables cut off
- **Solution:** Tables are set to avoid page breaks. If issues persist, use browser print.

## Next Steps

Once you have the PDF:

1. Review the PDF for any formatting issues
2. Update contact information in the Appendix section
3. Add your company logo if desired (edit HTML file)
4. Submit to AWS for credits application

---

**Last Updated:** January 2025

