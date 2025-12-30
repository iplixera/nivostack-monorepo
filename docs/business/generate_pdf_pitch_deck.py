#!/usr/bin/env python3
"""
Script to convert NivoStack AWS Credits Pitch Deck Markdown to PDF format.

This script tries multiple methods to ensure PDF generation:
1. pypandoc with wkhtmltopdf (best quality)
2. markdown2pdf with weasyprint
3. markdown with reportlab
4. HTML to PDF with weasyprint

Requirements:
    pip install pypandoc markdown2pdf weasyprint reportlab markdown

For PDF generation, you also need wkhtmltopdf (optional):
    macOS: brew install wkhtmltopdf
    Linux: sudo apt-get install wkhtmltopdf
"""

import os
import sys
from pathlib import Path

def convert_with_pypandoc():
    """Convert using pypandoc (recommended method)."""
    try:
        import pypandoc
        
        md_file = Path(__file__).parent / "NIVOSTACK_AWS_CREDITS_PITCH_DECK.md"
        pdf_file = md_file.with_suffix('.pdf')
        
        if not md_file.exists():
            print(f"Error: {md_file} not found")
            return False
        
        print(f"Converting {md_file} to PDF using pypandoc...")
        
        # Try with wkhtmltopdf first
        try:
            pypandoc.convert_file(
                str(md_file),
                'pdf',
                outputfile=str(pdf_file),
                extra_args=[
                    '--pdf-engine=wkhtmltopdf',
                    '--toc',
                    '--variable=geometry:margin=1in',
                    '--variable=fontsize:11pt',
                    '--variable=mainfont:Helvetica',
                ]
            )
            print(f"✓ Created: {pdf_file}")
            return True
        except Exception as e:
            print(f"wkhtmltopdf failed: {e}")
            # Try with pdflatex
            try:
                pypandoc.convert_file(
                    str(md_file),
                    'pdf',
                    outputfile=str(pdf_file),
                    extra_args=[
                        '--pdf-engine=pdflatex',
                        '--toc',
                        '-V', 'geometry:margin=1in',
                        '-V', 'fontsize=11pt',
                    ]
                )
                print(f"✓ Created: {pdf_file}")
                return True
            except Exception as e2:
                print(f"pdflatex also failed: {e2}")
                return False
        
    except ImportError:
        print("Error: pypandoc not installed. Install with: pip install pypandoc")
        return False
    except Exception as e:
        print(f"Error converting with pypandoc: {e}")
        return False

def convert_with_weasyprint():
    """Convert using markdown + weasyprint."""
    try:
        import markdown
        from weasyprint import HTML, CSS
        from weasyprint.text.fonts import FontConfiguration
        
        md_file = Path(__file__).parent / "NIVOSTACK_AWS_CREDITS_PITCH_DECK.md"
        pdf_file = md_file.with_suffix('.pdf')
        
        if not md_file.exists():
            print(f"Error: {md_file} not found")
            return False
        
        print(f"Reading {md_file}...")
        with open(md_file, 'r', encoding='utf-8') as f:
            md_content = f.read()
        
        # Convert markdown to HTML
        html_content = markdown.markdown(md_content, extensions=['extra', 'toc', 'tables', 'codehilite'])
        
        # Add CSS styling
        html_with_style = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                @page {{
                    size: letter;
                    margin: 1in;
                }}
                body {{
                    font-family: 'Helvetica', 'Arial', sans-serif;
                    font-size: 11pt;
                    line-height: 1.6;
                    color: #333;
                }}
                h1 {{
                    color: #1a1a1a;
                    font-size: 24pt;
                    margin-top: 24pt;
                    margin-bottom: 12pt;
                    page-break-after: avoid;
                }}
                h2 {{
                    color: #2a2a2a;
                    font-size: 18pt;
                    margin-top: 18pt;
                    margin-bottom: 9pt;
                    page-break-after: avoid;
                }}
                h3 {{
                    color: #3a3a3a;
                    font-size: 14pt;
                    margin-top: 14pt;
                    margin-bottom: 7pt;
                    page-break-after: avoid;
                }}
                p {{
                    margin-bottom: 8pt;
                }}
                ul, ol {{
                    margin-bottom: 12pt;
                    padding-left: 24pt;
                }}
                li {{
                    margin-bottom: 4pt;
                }}
                table {{
                    border-collapse: collapse;
                    width: 100%;
                    margin-bottom: 12pt;
                }}
                th, td {{
                    border: 1px solid #ddd;
                    padding: 8pt;
                    text-align: left;
                }}
                th {{
                    background-color: #f5f5f5;
                    font-weight: bold;
                }}
                code {{
                    background-color: #f4f4f4;
                    padding: 2pt 4pt;
                    border-radius: 3pt;
                    font-family: 'Courier New', monospace;
                    font-size: 10pt;
                }}
                pre {{
                    background-color: #f4f4f4;
                    padding: 12pt;
                    border-radius: 4pt;
                    overflow-x: auto;
                    page-break-inside: avoid;
                }}
                blockquote {{
                    border-left: 4pt solid #ddd;
                    padding-left: 12pt;
                    margin-left: 0;
                    color: #666;
                }}
            </style>
        </head>
        <body>
            {html_content}
        </body>
        </html>
        """
        
        print("Converting HTML to PDF with weasyprint...")
        font_config = FontConfiguration()
        HTML(string=html_with_style).write_pdf(
            pdf_file,
            stylesheets=[CSS(string="""
                @page {
                    size: letter;
                    margin: 1in;
                }
            """)],
            font_config=font_config
        )
        print(f"✓ Created: {pdf_file}")
        return True
        
    except ImportError as e:
        print(f"Error: Required library not installed: {e}")
        print("Install with: pip install markdown weasyprint")
        return False
    except Exception as e:
        print(f"Error converting with weasyprint: {e}")
        return False

def convert_with_reportlab():
    """Convert using markdown + reportlab (basic)."""
    try:
        import markdown
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        
        md_file = Path(__file__).parent / "NIVOSTACK_AWS_CREDITS_PITCH_DECK.md"
        pdf_file = md_file.with_suffix('.pdf')
        
        if not md_file.exists():
            print(f"Error: {md_file} not found")
            return False
        
        print(f"Reading {md_file}...")
        with open(md_file, 'r', encoding='utf-8') as f:
            md_content = f.read()
        
        # Convert markdown to HTML first, then parse
        html_content = markdown.markdown(md_content, extensions=['extra', 'toc'])
        
        # Create PDF
        doc = SimpleDocTemplate(str(pdf_file), pagesize=letter,
                              rightMargin=1*inch, leftMargin=1*inch,
                              topMargin=1*inch, bottomMargin=1*inch)
        
        styles = getSampleStyleSheet()
        story = []
        
        # Parse HTML and add to story (simplified)
        lines = md_content.split('\n')
        for line in lines:
            if line.startswith('# '):
                story.append(Paragraph(line[2:], styles['Title']))
                story.append(Spacer(1, 0.2*inch))
            elif line.startswith('## '):
                story.append(Paragraph(line[3:], styles['Heading1']))
                story.append(Spacer(1, 0.1*inch))
            elif line.startswith('### '):
                story.append(Paragraph(line[4:], styles['Heading2']))
                story.append(Spacer(1, 0.05*inch))
            elif line.strip():
                story.append(Paragraph(line, styles['Normal']))
                story.append(Spacer(1, 0.05*inch))
        
        doc.build(story)
        print(f"✓ Created: {pdf_file}")
        print("Note: This is a basic conversion. For better formatting, use pypandoc or weasyprint.")
        return True
        
    except ImportError as e:
        print(f"Error: Required library not installed: {e}")
        print("Install with: pip install markdown reportlab")
        return False
    except Exception as e:
        print(f"Error converting with reportlab: {e}")
        return False

def main():
    """Main conversion function."""
    print("=" * 70)
    print("NivoStack AWS Credits Pitch Deck - PDF Generator")
    print("=" * 70)
    print()
    
    md_file = Path(__file__).parent / "NIVOSTACK_AWS_CREDITS_PITCH_DECK.md"
    if not md_file.exists():
        print(f"Error: {md_file} not found!")
        print("Please ensure the markdown file exists.")
        return
    
    # Try methods in order of quality
    methods = [
        ("pypandoc (best quality)", convert_with_pypandoc),
        ("weasyprint (good quality)", convert_with_weasyprint),
        ("reportlab (basic)", convert_with_reportlab),
    ]
    
    for method_name, method_func in methods:
        print(f"\nTrying {method_name}...")
        if method_func():
            print(f"\n✓ Successfully created PDF using {method_name}!")
            pdf_file = md_file.with_suffix('.pdf')
            print(f"  Location: {pdf_file.absolute()}")
            return
    
    print("\n✗ All conversion methods failed.")
    print("\nPlease install required dependencies:")
    print("  pip install pypandoc markdown weasyprint reportlab")
    print("\nFor best results, also install:")
    print("  macOS: brew install wkhtmltopdf")
    print("  Linux: sudo apt-get install wkhtmltopdf")
    print("\nOr use online converters:")
    print("  - https://www.markdowntopdf.com/")
    print("  - https://dillinger.io/ (Export as PDF)")
    print("  - https://pandoc.org/try/")

if __name__ == '__main__':
    main()

