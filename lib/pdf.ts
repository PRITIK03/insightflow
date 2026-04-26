import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DataPoint, ForecastResult } from '@/types';

export async function generateReportPDF(
  data: DataPoint[],
  forecast: ForecastResult | null,
  title: string = 'InsightFlow Report'
): Promise<void> {
  const pdf = new jsPDF();

  // Title
  pdf.setFontSize(20);
  pdf.text(title, 20, 30);

  // Date
  pdf.setFontSize(12);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);

  let yPosition = 60;

  // Data Summary
  pdf.setFontSize(16);
  pdf.text('Data Summary', 20, yPosition);
  yPosition += 15;

  if (data.length > 0) {
    pdf.setFontSize(12);
    pdf.text(`Total data points: ${data.length}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Date range: ${data[0].date} to ${data[data.length - 1].date}`, 20, yPosition);
    yPosition += 10;
    const values = data.map(d => d.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    pdf.text(`Average value: ${avg.toFixed(2)}`, 20, yPosition);
    yPosition += 20;
  }

  // Forecast Results
  if (forecast) {
    pdf.setFontSize(16);
    pdf.text('Forecast Results', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.text(`Model: ${forecast.model}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`RMSE: ${forecast.metrics.rmse.toFixed(4)}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`MAE: ${forecast.metrics.mae.toFixed(4)}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`MAPE: ${forecast.metrics.mape.toFixed(2)}%`, 20, yPosition);
    yPosition += 10;
    pdf.text(`R²: ${forecast.metrics.r2.toFixed(4)}`, 20, yPosition);
    yPosition += 20;

    // Forecast values (first 10)
    pdf.setFontSize(14);
    pdf.text('Forecast Values (next 10 periods)', 20, yPosition);
    yPosition += 15;

    forecast.predictions.slice(0, 10).forEach((pred, i) => {
      pdf.setFontSize(10);
      pdf.text(`Period ${i + 1}: ${pred.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
    });
  }

  // Save the PDF
  pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
}