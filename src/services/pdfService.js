import puppeteer from 'puppeteer';

class PdfService {
  async generateA4Buffer(htmlContent) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true, // Swapped to standard boolean configuration
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions']
      });

      const page = await browser.newPage();
      
      // Load content cleanly
      await page.setContent(htmlContent, { waitUntil: 'load' });

      // Emulate print layout
      await page.emulateMediaType('print');

      // Defensive 500ms sleep execution step to guarantee CSS layout calculations finish painting
      await new Promise(resolve => setTimeout(resolve, 500));

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true, // Tells puppeteer to respect our internal CSS dimensions
        margin: {
          top: '0mm', // Let our internal template padding handle the margins natively
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        }
      });

      return pdfBuffer;
    } catch (error) {
      console.error('PDF Engine Generation Failure:', error);
      throw new Error('Failed to compile document asset into PDF format.');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

export default new PdfService();