import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Image, Trash2, Lock, Upload } from 'lucide-react';
import { toast } from 'sonner';

const fileTypeIcons = {
  blueprint: FileText,
  photo: Image,
  document: FileText,
  other: FileText
};

export default function ProjectFileManager({ scopeId, hasSubscription, isContractor }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!scopeId || !hasSubscription) return;

    const fetchFiles = async () => {
      try {
        const projectFiles = await base44.entities.ProjectFile.filter({ scope_id: scopeId });
        setFiles(projectFiles);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching files:', error);
        setLoading(false);
      }
    };

    fetchFiles();
    const unsubscribe = base44.entities.ProjectFile.subscribe((event) => {
      if (event.data?.scope_id === scopeId) {
        if (event.type === 'create') {
          setFiles(prev => [...prev, event.data]);
        } else if (event.type === 'delete') {
          setFiles(prev => prev.filter(f => f.id !== event.id));
        }
      }
    });

    return unsubscribe;
  }, [scopeId, hasSubscription]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadedFile = await base44.integrations.Core.UploadFile({ file });
      const user = await base44.auth.me();
      
      await base44.entities.ProjectFile.create({
        scope_id: scopeId,
        file_name: file.name,
        file_url: uploadedFile.file_url,
        file_type: file.type.includes('image') ? 'photo' : 'document',
        uploaded_by: user.email
      });
      
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await base44.entities.ProjectFile.delete(fileId);
      toast.success('File deleted');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  if (!hasSubscription) {
    return (
      <Card className="p-6 bg-slate-50 border-slate-200">
        <div className="flex items-center gap-3 text-slate-600">
          <Lock className="w-5 h-5" />
          <div>
            <p className="font-medium">File Sharing Locked</p>
            <p className="text-sm">Subscribe to the $50/month Communication plan to share project files.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-slate-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Project Files</h3>
          {isContractor && (
            <label>
              <Button asChild size="sm" variant="outline" disabled={uploading}>
                <span className="cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </span>
              </Button>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading files...</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-slate-500">No files shared yet</p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => {
              const IconComponent = fileTypeIcons[file.file_type] || FileText;
              return (
                <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 flex-1 hover:text-blue-600"
                  >
                    <IconComponent className="w-5 h-5 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{file.file_name}</p>
                      <p className="text-xs text-slate-500">{file.file_type}</p>
                    </div>
                  </a>
                  {isContractor && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}