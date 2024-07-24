import { PDFDocument, rgb } from 'pdf-lib';

export async function generatePdf(data: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  const { width, height } = page.getSize();
  
  page.drawText('Transaction Details', {
    x: 50,
    y: height - 50,
    size: 30,
    color: rgb(0, 0, 0),
  });

  page.drawText(`ID: ${data.id}`, { x: 50, y: height - 100 });
  page.drawText(`Date: ${data.date}`, { x: 50, y: height - 130 });

  // Add more details as needed

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}