# Converting Pitch Deck to Word and PDF

This document provides instructions for converting the AWS Credits Pitch Deck from Markdown to Word (.docx) and PDF formats.

## Method 1: Using pypandoc (Recommended - Best Quality)

### Prerequisites

1. Install Python dependencies:
```bash
pip install pypandoc python-docx
```

2. Install pandoc (required by pypandoc):
```bash
# macOS
brew install pandoc

# Linux (Ubuntu/Debian)
sudo apt-get install pandoc

# Windows
# Download from https://pandoc.org/installing.html
```

3. For PDF generation, install wkhtmltopdf:
```bash
# macOS
brew install wkhtmltopdf

# Linux (Ubuntu/Debian)
sudo apt-get install wkhtmltopdf

# Windows
# Download from https://wkhtmltopdf.org/downloads.html
```

### Conversion

Run the conversion script:
```bash
cd docs/business
python3 convert_to_word_pdf.py
```

Or use pypandoc directly:
```bash
# Convert to Word
pypandoc -f markdown -t docx AWS_CREDITS_PITCH_DECK.md -o AWS_CREDITS_PITCH_DECK.docx

# Convert to PDF
pypandoc -f markdown -t pdf AWS_CREDITS_PITCH_DECK.md -o AWS_CREDITS_PITCH_DECK.pdf --pdf-engine=wkhtmltopdf
```

## Method 2: Using Online Converters (Easiest)

### Markdown to Word (.docx)

1. **Zamzar** - https://www.zamzar.com/convert/md-to-docx/
   - Upload the `.md` file
   - Select `.docx` as output format
   - Download the converted file

2. **CloudConvert** - https://cloudconvert.com/md-to-docx
   - Upload the `.md` file
   - Select `.docx` as output format
   - Download the converted file

3. **Markdown to PDF** - https://www.markdowntopdf.com/
   - Upload the `.md` file
   - Download the PDF
   - Then convert PDF to Word if needed

### Markdown to PDF

1. **Markdown to PDF** - https://www.markdowntopdf.com/
   - Upload the `.md` file
   - Download the PDF

2. **Dillinger** - https://dillinger.io/
   - Paste markdown content
   - Click "Export as" → PDF

3. **Pandoc Try** - https://pandoc.org/try/
   - Paste markdown content
   - Select PDF output
   - Download

## Method 3: Using VS Code Extensions

If you use VS Code:

1. Install "Markdown PDF" extension
2. Open the `.md` file
3. Right-click → "Markdown PDF: Export (pdf)"
4. For Word, export to PDF first, then convert PDF to Word

## Method 4: Using Pandoc Command Line (Advanced)

If you have pandoc installed:

```bash
# Convert to Word
pandoc AWS_CREDITS_PITCH_DECK.md -o AWS_CREDITS_PITCH_DECK.docx

# Convert to PDF (requires LaTeX)
pandoc AWS_CREDITS_PITCH_DECK.md -o AWS_CREDITS_PITCH_DECK.pdf

# Convert to PDF with better formatting
pandoc AWS_CREDITS_PITCH_DECK.md -o AWS_CREDITS_PITCH_DECK.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=1in \
  --toc
```

## Method 5: Manual Copy-Paste (Simple but Time-Consuming)

1. Open the `.md` file in a markdown viewer (VS Code, GitHub, etc.)
2. Copy the formatted content
3. Paste into Microsoft Word or Google Docs
4. Format as needed
5. Export as PDF from Word/Google Docs

## Recommended Approach

For the best results, I recommend:

1. **For Word (.docx):** Use Method 1 (pypandoc) or Method 2 (CloudConvert)
2. **For PDF:** Use Method 1 (pypandoc) or Method 2 (Markdown to PDF)

## File Locations

After conversion, you should have:
- `docs/business/AWS_CREDITS_PITCH_DECK.md` (original)
- `docs/business/AWS_CREDITS_PITCH_DECK.docx` (Word format)
- `docs/business/AWS_CREDITS_PITCH_DECK.pdf` (PDF format)

## Notes

- The markdown file uses standard markdown syntax and should convert cleanly
- Headers, lists, tables, and code blocks should be preserved
- You may need to adjust formatting in Word after conversion
- For professional presentations, consider creating a PowerPoint version as well

## Troubleshooting

**Issue:** pypandoc not found
- Solution: Install pandoc separately (see Prerequisites)

**Issue:** PDF generation fails
- Solution: Install wkhtmltopdf or use LaTeX engine

**Issue:** Formatting looks off
- Solution: Use a reference Word document with pypandoc: `--reference-doc=reference.docx`

**Issue:** Tables not converting properly
- Solution: Use online converters or manually recreate tables in Word




