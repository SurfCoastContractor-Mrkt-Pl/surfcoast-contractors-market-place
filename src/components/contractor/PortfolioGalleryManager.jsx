import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Plus, Trash2, Eye, Edit2, Upload } from 'lucide-react';

export default function PortfolioGalleryManager({ contractorId }) {
  const [portfolio, setPortfolio] = useState([
    {
      id: 1,
      title: 'Kitchen Renovation',
      category: 'carpenter',
      images: [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop'
      ],
      description: 'Complete kitchen remodel with custom cabinetry and new appliances',
      completedDate: '2026-02-15',
      featured: true
    },
    {
      id: 2,
      title: 'Bathroom Modernization',
      category: 'plumber',
      images: [
        'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=400&fit=crop'
      ],
      description: 'Modern bathroom upgrade with new fixtures and tiling',
      completedDate: '2026-01-20',
      featured: false
    }
  ]);

  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const toggleFeatured = (id) => {
    setPortfolio(portfolio.map(p =>
      p.id === id ? { ...p, featured: !p.featured } : p
    ));
  };

  const deleteProject = (id) => {
    setPortfolio(portfolio.filter(p => p.id !== id));
  };

  const categories = [
    'electrician', 'plumber', 'carpenter', 'hvac',
    'mason', 'roofer', 'painter', 'general'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Portfolio Gallery</h2>
          <p className="text-sm text-slate-600 mt-1">Showcase your best work and completed projects</p>
        </div>
        <Button onClick={() => setShowForm(true)} gap="2">
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </div>

      {/* Add/Edit Project Form */}
      {showForm && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Project Title</label>
              <input
                type="text"
                placeholder="e.g., Kitchen Renovation"
                defaultValue={editingProject?.title || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                placeholder="Describe the project, materials used, and outcome..."
                defaultValue={editingProject?.description || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-24 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Upload Images</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB each</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingProject(null); }}>
                Cancel
              </Button>
              <Button className="bg-blue-600">Save Project</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Portfolio Grid */}
      {portfolio.length > 0 ? (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Projects ({portfolio.length})</TabsTrigger>
            <TabsTrigger value="featured">Featured ({portfolio.filter(p => p.featured).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {portfolio.map(project => (
              <Card key={project.id} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                  {/* Images */}
                  <div className="md:col-span-2 space-y-2">
                    {project.images.length > 0 ? (
                      <>
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {project.images.length > 1 && (
                          <div className="flex gap-2">
                            {project.images.slice(1, 3).map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`${project.title} ${idx + 2}`}
                                className="w-24 h-24 object-cover rounded"
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Image className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="md:col-span-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{project.title}</h3>
                        {project.featured && (
                          <Badge className="bg-amber-100 text-amber-700">Featured</Badge>
                        )}
                      </div>

                      <Badge variant="outline" className="text-xs mb-3 capitalize">
                        {project.category}
                      </Badge>

                      <p className="text-sm text-slate-600 line-clamp-3">{project.description}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        Completed: {new Date(project.completedDate).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeatured(project.id)}
                        className="text-xs"
                      >
                        {project.featured ? '⭐ Featured' : '☆ Feature'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProject(project)}
                        className="gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProject(project.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="featured" className="space-y-4">
            {portfolio.filter(p => p.featured).map(project => (
              <Card key={project.id} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                  <div className="md:col-span-2">
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{project.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-3 mb-3">{project.description}</p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {project.category}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-12 text-center">
          <Image className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">No portfolio projects yet</p>
          <Button onClick={() => setShowForm(true)}>Add Your First Project</Button>
        </Card>
      )}
    </div>
  );
}