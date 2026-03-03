import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import PortfolioManager from './PortfolioManager';

export default function PortfolioDisplay({ contractorId, isOwnProfile = false }) {
  const [managerOpen, setManagerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio', contractorId],
    queryFn: () => base44.entities.PortfolioProject.filter({ contractor_id: contractorId }, '-completion_date'),
    enabled: !!contractorId
  });

  if (!portfolio || portfolio.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-600 mb-4">
          {isOwnProfile ? 'No portfolio projects yet. Showcase your best work!' : 'No portfolio items available.'}
        </p>
        {isOwnProfile && (
          <Button onClick={() => setManagerOpen(true)} className="bg-amber-500 hover:bg-amber-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Portfolio Project
          </Button>
        )}
        <PortfolioManager contractorId={contractorId} open={managerOpen} onClose={() => setManagerOpen(false)} />
      </div>
    );
  }

  if (selectedProject) {
    const images = selectedProject.images || [];
    const currentImage = images[currentImageIndex];

    if (!currentImage && images.length === 0) {
      return (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedProject(null)}
            className="text-amber-600 hover:text-amber-700 font-semibold text-sm"
          >
            ← Back to Portfolio
          </button>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-2xl font-bold mb-2">{selectedProject.project_title}</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{selectedProject.description}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedProject(null)}
          className="text-amber-600 hover:text-amber-700 font-semibold text-sm"
        >
          ← Back to Portfolio
        </button>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-2xl font-bold mb-2">{selectedProject.project_title}</h2>
          <p className="text-sm text-slate-600 mb-4">
            Completed {format(new Date(selectedProject.completion_date), 'MMMM d, yyyy')}
          </p>

          {images.length > 0 && (
            <div className="mb-6">
              <div className="relative bg-slate-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center mb-4">
                <img
                  src={currentImage.url}
                  alt={currentImage.caption || selectedProject.project_title}
                  className="w-full h-full object-cover"
                />
              </div>
              {currentImage.caption && (
                <p className="text-sm text-slate-600 italic mb-3">{currentImage.caption}</p>
              )}
              {images.length > 1 && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                    disabled={currentImageIndex === 0}
                    className="p-2 hover:bg-slate-100 rounded disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-slate-600">
                    {currentImageIndex + 1} of {images.length}
                  </span>
                  <button
                    onClick={() => setCurrentImageIndex(Math.min(images.length - 1, currentImageIndex + 1))}
                    disabled={currentImageIndex === images.length - 1}
                    className="p-2 hover:bg-slate-100 rounded disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Project Details</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{selectedProject.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Portfolio</h2>
        {isOwnProfile && (
          <Button onClick={() => setManagerOpen(true)} className="bg-amber-500 hover:bg-amber-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolio.map(project => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="cursor-pointer bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {project.images && project.images.length > 0 && (
              <div className="relative bg-slate-100 aspect-square overflow-hidden">
                <img
                  src={project.images[0].url}
                  alt={project.project_title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
                {project.images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    +{project.images.length - 1}
                  </div>
                )}
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-1">{project.project_title}</h3>
              <p className="text-xs text-slate-600 mb-2 line-clamp-2">{project.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="capitalize">{project.trade_category}</span>
                <span>{format(new Date(project.completion_date), 'MMM yyyy')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PortfolioManager contractorId={contractorId} open={managerOpen} onClose={() => setManagerOpen(false)} />
    </div>
  );
}