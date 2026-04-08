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
      try {
        const uploadedFile = await base44.integrations.Core.UploadFile({ file });
        return base44.entities.ProjectFile.create({
          scope_id: scopeId,
          file_name: file.name,
          file_url: uploadedFile.file_url,
          file_type: file.type.includes('image') ? 'photo' : 'document',
          uploaded_by: userEmail,
          uploaded_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('File upload failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectFiles', scopeId] });
      setIsUploading(false);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setIsUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProjectFile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectFiles', scopeId] });
    },
    onError: (error) => {
      console.error('Delete failed:', error);
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
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors">
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 text-slate-400 mx-auto mb-2 animate-spin" />
              <p className="text-sm font-medium text-slate-700">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Click to upload files</p>
              <p className="text-xs text-slate-500">or drag and drop</p>
            </>
          )}
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
          files.map((file) => {
            const isImage = file.file_type === 'photo' || /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(file.file_url || '');
            return (
              <div key={file.id} className="border border-slate-100 rounded-lg overflow-hidden">
                {isImage ? (
                  <div className="relative group">
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={file.file_url}
                        alt={file.file_name}
                        className="w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    </a>
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50">
                      <p className="text-xs text-slate-500 truncate">{file.file_name}</p>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-slate-200 rounded">
                          <Download className="w-3 h-3 text-blue-600" />
                        </a>
                        {file.uploaded_by === userEmail && (
                          <button onClick={() => deleteMutation.mutate(file.id)} className="p-1 hover:bg-slate-200 rounded">
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 hover:bg-slate-50 gap-2 sm:gap-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <File className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{file.file_name}</p>
                        <p className="text-xs text-slate-500">{file.uploaded_by === userEmail ? 'You' : 'Other party'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none p-2 hover:bg-slate-200 rounded text-center sm:text-left">
                        <Download className="w-4 h-4 text-blue-600 mx-auto sm:mx-0" />
                      </a>
                      {file.uploaded_by === userEmail && (
                        <button onClick={() => deleteMutation.mutate(file.id)} className="flex-1 sm:flex-none p-2 hover:bg-slate-200 rounded text-center sm:text-left">
                          <Trash2 className="w-4 h-4 text-red-600 mx-auto sm:mx-0" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}