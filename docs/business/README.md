# Plixera Business Documentation

This directory contains business documentation for Plixera and DevBridge, including investor materials, sales decks, and AWS credits applications.

## Files

### AWS Credits Pitch Deck

- **`AWS_CREDITS_PITCH_DECK.md`** - Markdown version (source)
- **`AWS_CREDITS_PITCH_DECK.html`** - HTML version (easy to convert to PDF)
- **`CONVERSION_INSTRUCTIONS.md`** - Detailed instructions for converting to Word/PDF
- **`convert_to_word_pdf.py`** - Python script for automated conversion

## Quick Start

### To Generate Word Document (.docx)

**Option 1: Online Converter (Easiest)**
1. Go to https://cloudconvert.com/md-to-docx
2. Upload `AWS_CREDITS_PITCH_DECK.md`
3. Download the converted `.docx` file

**Option 2: Using HTML (Good Quality)**
1. Open `AWS_CREDITS_PITCH_DECK.html` in a web browser
2. File → Print → Save as PDF
3. Open PDF in Word or use online PDF to Word converter

**Option 3: Using Python Script**
```bash
cd docs/business
pip install pypandoc python-docx
python3 convert_to_word_pdf.py
```

### To Generate PDF

**Option 1: From HTML (Easiest)**
1. Open `AWS_CREDITS_PITCH_DECK.html` in Chrome/Safari
2. File → Print → Save as PDF
3. Choose "Save as PDF" as destination

**Option 2: Online Converter**
1. Go to https://www.markdowntopdf.com/
2. Upload `AWS_CREDITS_PITCH_DECK.md`
3. Download the PDF

**Option 3: Using Python Script**
```bash
cd docs/business
pip install pypandoc
brew install wkhtmltopdf  # macOS
python3 convert_to_word_pdf.py
```

## Document Overview

The AWS Credits Pitch Deck includes:

1. **Executive Summary** - Overview of Plixera and DevBridge
2. **Company Overview** - Mission, vision, company details
3. **Product Overview** - DevBridge features and differentiators
4. **Market Opportunity** - Market size, target customers, competitive landscape
5. **Technology Stack & AWS Usage** - Current architecture and planned AWS services
6. **Use Case for AWS Credits** - How credits will be used and expected outcomes
7. **Business Model & Traction** - Pricing, revenue projections, current status
8. **Team & Roadmap** - Team composition and product roadmap
9. **Why AWS Credits Matter** - Impact on business and commitment to AWS
10. **Request Summary** - Credits requested and expected ROI

## Key Information

- **Company:** Plixera
- **Product:** DevBridge
- **Request:** $10,000-16,000 AWS credits over 12 months
- **Purpose:** Infrastructure scaling and migration to AWS
- **Market:** $8.5B+ APM market
- **Status:** Production-ready (v1.5.0)

## Customization

Before submitting, update the following in the documents:

1. **Contact Information** (in Appendix section):
   - Email address
   - Phone number
   - Additional contact details

2. **Company Details** (if different):
   - Founded date
   - Company location
   - Team size

3. **Product Links**:
   - GitHub repository (if public)
   - Documentation links
   - Roadmap links

4. **Financial Projections** (if you have actual data):
   - Current MRR
   - Customer count
   - Growth metrics

## Next Steps

1. Review and customize the pitch deck with your specific information
2. Convert to Word/PDF using one of the methods above
3. Review formatting and adjust as needed
4. Submit to AWS Activate or AWS Startup Credits program
5. Follow up with AWS team as needed

## Additional Resources

- [AWS Activate](https://aws.amazon.com/activate/)
- [AWS Startup Credits](https://aws.amazon.com/startups/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

## Support

For questions or updates to these documents, please contact the Plixera team.

---

**Last Updated:** December 2024




