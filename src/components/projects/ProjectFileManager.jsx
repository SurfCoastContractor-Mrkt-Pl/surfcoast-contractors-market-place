import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, Download, Trash2, Loader2 } from 'lucide-react';

export default function ProjectFileManager({ files, scopeId, isContractor }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('photo');
  const [description, setDescription] = useState('');

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      const fileBlob = data.file;
      const uploadRes = await base44.integrations.Core.UploadFile({ file: fileBlob });
      
      return base44.entities.ProjectFile.create({
        scope_id: scopeId,
        file_name: data.file.name,
        file_url: uploadRes.file_url,
        file_type: fileType,
        uploaded_by: 'current_user@example.com',
        uploaded_at: new Date().toISOString(),
        description: description || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', scopeId] });
      setSelectedFile(null);
      setDescription('');
      setFileType('photo');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProjectFile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', scopeId] });
    }
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    await uploadMutation.mutateAsync({ file: selectedFile });
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      {isContractor && (
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <Label className="text-sm font-semibold mb-3 block">Upload Project File</Label>
          <div className="space-y-3">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
            />
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blueprint">Blueprint</SelectItem>
                <SelectItem value="photo">Progress Photo</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm"
            />
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />Upload File</>
              )}
            </Button>
          </div>
        </div>
      )}

      {files && files.length > 0 ? (
        <div className="space-y-2">
          {files.map(file => (
            <div
              key={file.id}
              className="p-3 border border-slate-200 rounded-lg flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{file.file_name}</p>
                    <span className="inline-block px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded capitalize shrink-0">
                      {file.file_type}
                    </span>
                  </div>
                  {file.description && (
                    <p className="text-xs text-slate-600 mt-1">{file.description}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">by {file.uploaded_by}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-slate-200 rounded transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                </a>
                {isContractor && (
                  <button
                    onClick={() => deleteMutation.mutate(file.id)}
                    className="p-2 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <p>No files shared yet.</p>
        </div>
      )}
    </div>
  );
}