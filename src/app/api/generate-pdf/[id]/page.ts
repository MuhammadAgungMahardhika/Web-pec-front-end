import Config from '@/app/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb } from 'pdf-lib';

const cashierServiceURL = Config.CASHIERSERVICE_URl; // Replace with the actual URL of your external API

async function fetchTransactionData(id: string) {
  const response = await fetch(`${cashierServiceURL}/transactions/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch transaction data');
  }
  return await response.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query;

  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  try {
    // Fetch transaction data from the external API
    const transactionData = await fetchTransactionData(id);

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();

    // Draw transaction data on the PDF
    page.drawText(`Transaction ID: ${transactionData.id}`, { x: 50, y: height - 100, size: 30, color: rgb(0, 0, 0) });
    page.drawText(`Date: ${transactionData.date}`, { x: 50, y: height - 140, size: 30, color: rgb(0, 0, 0) });

    // Add more data as needed

    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();

    // Set the response headers and send the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=transaction-${id}.pdf`);
    res.send(pdfBytes);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
