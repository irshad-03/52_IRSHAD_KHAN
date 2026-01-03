'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

interface PDFExportProps {
  reportData: any;
}

const FONT_FAMILIES = [
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'times', label: 'Times' },
  { value: 'courier', label: 'Courier' },
];

const FONT_SIZES = [10, 12, 14, 16, 18, 20];

export default function PDFExport({ reportData }: PDFExportProps) {
  const [fontFamily, setFontFamily] = useState('helvetica');
  const [fontSize, setFontSize] = useState(12);
  const [showSettings, setShowSettings] = useState(false);
  const [exporting, setExporting] = useState(false);

  const generatePDF = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Set font
      pdf.setFont(fontFamily);
      pdf.setFontSize(fontSize);

      // Add title
      pdf.setFontSize(fontSize + 6);
      pdf.text('Financial MD&A Report', margin, yPosition);
      yPosition += 15;

      // Add date
      pdf.setFontSize(fontSize - 2);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 10;

      // Add summary metrics
      pdf.setFontSize(fontSize + 2);
      pdf.text('Key Metrics', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(fontSize);
      const metrics = [
        `YoY Revenue Change: ${reportData.yoy_change?.toFixed(2)}%`,
        `QoQ Revenue Change: ${reportData.qoq_change?.toFixed(2)}%`,
        `Total Revenue: $${reportData.total_revenue?.toLocaleString()}`,
      ];

      metrics.forEach((metric) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(metric, margin, yPosition);
        yPosition += 8;
      });

      yPosition += 5;

      // Add report content
      pdf.setFontSize(fontSize + 2);
      pdf.text('Management Discussion & Analysis', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(fontSize);
      const reportText = reportData.markdown_report || 'No report content available.';
      const lines = pdf.splitTextToSize(reportText, contentWidth);

      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Save PDF
      pdf.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported successfully!');
    } catch (error: any) {
      toast.error('Failed to generate PDF: ' + error.message);
    } finally {
      setExporting(false);
      setShowSettings(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Download className="h-5 w-5 text-primary-600" />
          <span>Export Report</span>
        </h3>
        <div className="flex items-center space-x-4">
          {showSettings && (
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size
                </label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  {FONT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}pt
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={generatePDF}
            disabled={exporting}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>{exporting ? 'Generating...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

