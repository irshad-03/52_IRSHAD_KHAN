'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import FileUpload from '@/components/FileUpload';
import ReportGenerator from '@/components/ReportGenerator';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    toast.success('File uploaded successfully!');
  };

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Financial Report Dashboard</h1>
        <div className="space-y-8">
          <FileUpload onFileUpload={handleFileUpload} />
          {uploadedFile && (
            <ReportGenerator
              file={uploadedFile}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

