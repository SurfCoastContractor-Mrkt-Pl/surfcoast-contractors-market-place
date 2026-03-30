import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ImageIcon, Calendar, Pencil } from 'lucide-react';
import PortfolioManager from '../contractors/PortfolioManager';

const TRADE_LABELS = {
  electrician: 'Electrician', plumber: 'Plumber', carpenter: 'Carpenter',
  hvac: 'HVAC', mason: 'Mason', roofer: 'Roofer', painter: 'Painter',
  welder: 'Welder', tiler: 'Tiler', landscaper: 'Landscaper', other: 'Other'
};

export default function PortfolioDisplay({ contractorId, isOwner = false }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio', contractorId],
    queryFn: () => base44.entities.PortfolioProject.filter({ contractor_id: contractorId }, '-completion_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId) => base44.entities.PortfolioProject.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', contractorId] });
    }
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Portfolio</h3>
        </div>
        <div className="grid gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-40 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Portfolio</h3>
        </div>
        {isOwner && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setEditingProject(null); setDialogOpen(true); }}
            className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        )}
      </div>

      {portfolio && portfolio.length > 0 ? (
        <div className="grid gap-4">
          {portfolio.map(project => (
            <div key={project.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* Together photo thumbnail takes priority */}
              {project.scope_id && project.together_photo_url ? (
                <div className="relative">
                  <img
                    src={project.together_photo_url}
                    alt="Job together photo"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    📸 On-site photo
                  </div>
                </div>
              ) : project.images && project.images.length > 0 ? (
                <div className="flex gap-2 p-4 pb-0 overflow-x-auto">
                  {project.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={img.caption || `Project ${idx + 1}`}
                      className="w-32 h-32 object-cover rounded-lg shrink-0"
                      title={img.caption}
                    />
                  ))}
                </div>
              ) : null}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-slate-900">{project.project_title}</h4>
                  {isOwner && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { setEditingProject(project); setDialogOpen(true); }}
                        className="p-1.5 hover:bg-blue-100 rounded text-blue-600"
                        title="Edit project"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(project.id)}
                        className="p-1.5 hover:bg-red-100 rounded text-red-600"
                        disabled={deleteMutation.isPending}
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-100 text-blue-700">
                    {TRADE_LABELS[project.trade_category]}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.completion_date).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-sm text-slate-600">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {isOwner ? 'Add completed projects to showcase your work' : 'No portfolio projects yet'}
          </p>
        </div>
      )}

      <PortfolioManager
        contractorId={contractorId}
        open={dialogOpen}
        project={editingProject}
        onClose={() => { setDialogOpen(false); setEditingProject(null); }}
      />
    </Card>
  );
}