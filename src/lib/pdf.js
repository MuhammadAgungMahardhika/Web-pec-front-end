// lib/pdf.js
import { PDFDocument, rgb } from 'pdf-lib';

export async function createPdf(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const { width, height } = page.getSize();

  page.drawText('PDF with Server Data', {
    x: 50,
    y: height - 50,
    size: 30,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Name: Test`, {
    x: 50,
    y: height - 100,
    size: 20,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Age: Test`, {
    x: 50,
    y: height - 130,
    size: 20,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}