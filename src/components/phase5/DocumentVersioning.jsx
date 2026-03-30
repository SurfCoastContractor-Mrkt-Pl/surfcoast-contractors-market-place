import React, { useState } from 'react';
import { FileText, History, Download, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export default function DocumentVersioning({ file, versions = [] }) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  if (!file) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" /> Document Versions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">No document selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" /> Version History
        </CardTitle>
        <CardDescription>{file.file_name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {versions.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No versions yet</p>
        ) : (
          <>
            {/* Version List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  onClick={() => setSelectedVersion(version)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedVersion?.id === version.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        v{versions.length - index}
                        {index === 0 && ' (Current)'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {format(new Date(version.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        by {version.created_by?.split('@')[0] || 'Unknown'}
                      </p>
                    </div>
                    {version.note && (
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded ml-2 flex-shrink-0">
                        {version.note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Version Actions */}
            {selectedVersion && (
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(selectedVersion.file_url, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" /> Preview
                  </Button>
                </div>
                
                {selectedVersion.id !== versions[0].id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-blue-600 hover:text-blue-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Restore This Version
                  </Button>
                )}
              </div>
            )}

            {/* Comparison Mode */}
            <div className="pt-4 border-t border-slate-200">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isComparing}
                  onChange={(e) => setIsComparing(e.target.checked)}
                  className="rounded"
                />
                <span className="text-slate-700">Compare versions</span>
              </label>
              
              {isComparing && (
                <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-2">
                    Select two versions to compare side-by-side
                  </p>
                  <p className="text-xs text-slate-500">
                    Diff viewer shows changes between versions
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}