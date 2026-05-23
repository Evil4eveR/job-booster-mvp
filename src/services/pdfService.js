import PDFDocument from 'pdfkit';

export const buildAssetPdfStream = (res, title, textData) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);

  doc.pipe(res);

  // Simple clean professional styling
  doc.fillColor('#1e293b').fontSize(24).text(title, { underline: true });
  doc.moveDown(1.5);
  
  doc.fillColor('#334155').fontSize(11).text(textData, {
    lineGap: 5,
    align: 'left'
  });

  doc.end();
};