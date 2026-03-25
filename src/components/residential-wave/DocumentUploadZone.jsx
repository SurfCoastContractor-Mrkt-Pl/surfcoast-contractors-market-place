import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const DOCUMENT_TYPES = {
  cslb_contractor_license: 'CSLB Contractor License',
  his_license: 'H.I.S. License',
  bond: 'Bond Document',
  insurance: 'Insurance Certificate',
  other: 'Other Document'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function DocumentUploadZone({ onUploadComplete, selectedType = 'cslb_contractor_license' }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = async (files) => {
    setError(null);
    
    if (files.length === 0) return;
    
    const file = files[0];
    
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 10MB limit. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    setUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const response = await base44.integrations.Core.UploadFile({
            file: event.target.result
          });
          
          onUploadComplete({
            file_url: response.file_url,
            file_name: file.name,
            file_size: file.size,
            document_type: selectedType
          });
          
          setUploading(false);
        } catch (err) {
          console.error('Upload error:', err);
          setError('Failed to upload file. Please try again.');
          setUploading(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File reading error:', err);
      setError('Failed to read file');
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full space-y-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
        } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
        />
        
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-blue-600 font-medium">Uploading...</span>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-900 mb-1">
              {DOCUMENT_TYPES[selectedType]}
            </p>
            <p className="text-slate-600 text-sm mb-2">Click to select or drag and drop</p>
            <p className="text-xs text-slate-500">PDF, JPG, or PNG • Max 10MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}