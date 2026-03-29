import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ServiceTemplateManager from '@/components/contractor/ServiceTemplateManager';

export default function ContractorServices() {
  const [user, setUser] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const contractors = await base44.entities.Contractor.filter({
          email: currentUser.email,
        });

        if (contractors.length > 0) {
          setContractor(contractors[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Contractor Profile Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You need to complete your contractor profile to access service templates.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Service Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage reusable service templates for your proposals
          </p>
        </div>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="templates">Service Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-6">
            <ServiceTemplateManager contractorId={contractor.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}