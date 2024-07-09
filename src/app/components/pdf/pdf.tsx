import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ExportToPDF = () => {
  const input: any = document.getElementById("pdfContent");
  html2canvas(input).then((canvas) => {
    const imgData: any = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgWidth = 190; // Lebar gambar dalam PDF
    const pageHeight = 290; // Tinggi halaman dalam PDF
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Menghitung tinggi gambar agar proporsional
    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("prescription.pdf");
  });
};

export default ExportToPDF;
