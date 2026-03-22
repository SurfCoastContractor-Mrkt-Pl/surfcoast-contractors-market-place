import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, Download, Trash2, Upload, Eye, Lock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const DOCUMENT_CATEGORIES = [
  { id: 'contracts', label: 'Contracts', icon: '📋', color: 'blue' },
  { id: 'certifications', label: 'Certifications', icon: '🎓', color: 'purple' },
  { id: 'licenses', label: 'Licenses', icon: '📜', color: 'green' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️', color: 'red' },
  { id: 'invoices', label: 'Invoices', icon: '💰', color: 'amber' },
  { id: 'other', label: 'Other', icon: '📁', color: 'slate' },
];

export default function DocumentManagementHub({ contractorId }) {
  const [selectedCategory, setSelectedCategory] = useState('contracts');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: projectFiles } = useQuery({
    queryKey: ['contractor-project-files', contractorId],
    queryFn: () => base44.entities.ProjectFile.filter({ contractor_id: contractorId }),
    enabled: !!contractorId,
  });

  const filteredFiles = projectFiles?.filter(f => f.file_type === selectedCategory) || [];

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId) => {
      await base44.entities.ProjectFile.delete(fileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-project-files', contractorId] });
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.ProjectFile.create({
        scope_id: contractorId,
        file_name: file.name,
        file_url: uploadRes.file_url,
        file_type: selectedCategory,
        uploaded_by: contractorId,
        description: `${selectedCategory} document`,
      });
      queryClient.invalidateQueries({ queryKey: ['contractor-project-files', contractorId] });
    } finally {
      setUploading(false);
    }
  };

  const categoryConfig = DOCUMENT_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Document Management Hub</h2>
        <p className="text-xs text-slate-500 mb-4">Organize and manage all your business documents in one secure location.</p>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {DOCUMENT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3 rounded-lg text-center transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-100 border-2 border-blue-300'
                  : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="text-xl mb-1">{cat.icon}</div>
              <div className="text-xs font-medium text-slate-700">{cat.label}</div>
            </button>
          ))}
        </div>

        {/* Upload Section */}
        <div className="mb-6 p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 transition-colors">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-sm font-medium text-slate-700">
              {uploading ? 'Uploading...' : `Upload ${categoryConfig?.label}`}
            </span>
            <span className="text-xs text-slate-500 mt-1">Click to select a file</span>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Documents List */}
        {filteredFiles.length > 0 ? (
          <div className="space-y-2">
            {filteredFiles.map(file => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{file.file_name}</div>
                    <div className="text-xs text-slate-500">{file.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                    title="View document"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="p-1.5 hover:bg-red-100 rounded text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Document</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteFileMutation.mutate(file.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">
            No {categoryConfig?.label.toLowerCase()} uploaded yet. Upload one to get started.
          </p>
        )}
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          All documents are securely stored. You control document visibility to customers via visibility settings.
        </p>
      </div>
    </Card>
  );
}