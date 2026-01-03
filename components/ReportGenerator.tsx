'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, Download, BarChart3, FileText } from 'lucide-react';
import ChartDisplay from './ChartDisplay';
import PDFExport from './PDFExport';

interface ReportGeneratorProps {
  file: File;
  onAnalysisComplete: (data: any) => void;
}

export default function ReportGenerator({ file, onAnalysisComplete }: ReportGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analyze`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setReportData(response.data);
      onAnalysisComplete(response.data);
      toast.success('Report generated successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to generate report';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary-600" />
          <span>Generate MD&A Report</span>
        </h2>
        <button
          onClick={generateReport}
          disabled={loading}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <BarChart3 className="h-5 w-5" />
              <span>Generate Report</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {reportData && (
        <div className="space-y-6">
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Financial Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">YoY Revenue Change</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reportData.yoy_change?.toFixed(2)}%
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">QoQ Revenue Change</p>
                <p className="text-2xl font-bold text-green-600">
                  {reportData.qoq_change?.toFixed(2)}%
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${reportData.total_revenue?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {reportData.chart_data && (
            <ChartDisplay chartData={reportData.chart_data} />
          )}

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">MD&A Report</h3>
            <div className="prose max-w-none bg-gray-50 p-6 rounded-lg">
              <div
                dangerouslySetInnerHTML={{ __html: reportData.markdown_report?.replace(/\n/g, '<br />') || '' }}
              />
            </div>
          </div>

          <PDFExport reportData={reportData} />
        </div>
      )}
    </div>
  );
}

