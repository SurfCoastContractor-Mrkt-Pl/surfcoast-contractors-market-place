import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, File, Trash2, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProjectFileManager({ scopeId, userEmail }) {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['projectFiles', scopeId],
    queryFn: () => base44.entities.ProjectFile.filter(
      { scope_id: scopeId },
      '-uploaded_at',
      100
    ),
    enabled: !!scopeId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const uploadedFile = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.ProjectFile.create({
        scope_id: scopeId,
        file_name: file.name,
        file_url: uploadedFile.file_url,
        file_type: file.type.includes('image') ? 'photo' : 'document',
        uploaded_by: userEmail,
        uploaded_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectFiles', scopeId] });
      setIsUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProjectFile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectFiles', scopeId] });
    },
  });

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Project Files</h3>

      {/* Upload Area */}
      <label className="block mb-4">
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">Click to upload files</p>
          <p className="text-xs text-slate-500">or drag and drop</p>
          <input
            type="file"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
        </div>
      </label>

      {/* Files List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : files.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No files yet</p>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {file.file_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {file.uploaded_by === userEmail ? 'You' : 'Other party'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-slate-200 rounded"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                </a>
                {file.uploaded_by === userEmail && (
                  <button
                    onClick={() => deleteMutation.mutate(file.id)}
                    className="p-1.5 hover:bg-slate-200 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}