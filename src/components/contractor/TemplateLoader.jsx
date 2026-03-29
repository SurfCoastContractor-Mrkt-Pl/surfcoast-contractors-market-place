import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy } from 'lucide-react';

export default function TemplateLoader({ contractorId, onLoadTemplate }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['serviceTemplates', contractorId],
    queryFn: () => base44.entities.ServiceOffering.filter({ contractor_id: contractorId }),
    enabled: dialogOpen,
  });

  const handleSelectTemplate = (template) => {
    onLoadTemplate({
      service_name: template.data.service_name,
      description: template.data.description,
      estimated_duration: template.data.estimated_duration,
      price_type: template.data.price_type,
      price_amount: template.data.price_amount,
      notes: template.data.notes,
    });
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Copy className="w-4 h-4 mr-2" />
          Load Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Load Service Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-4">Loading templates...</p>
          ) : templates.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No templates yet. Create one first.</p>
          ) : (
            templates.map((template) => (
              <Card
                key={template.id}
                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{template.data.service_name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{template.data.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-600">
                      {template.data.estimated_duration && (
                        <span>Duration: {template.data.estimated_duration}</span>
                      )}
                      <span>
                        {template.data.price_type === 'hourly' ? '$' : ''}{template.data.price_amount}
                        {template.data.price_type === 'hourly' ? '/hr' : ''}
                      </span>
                    </div>
                  </div>
                  <Button size="sm">Use</Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}