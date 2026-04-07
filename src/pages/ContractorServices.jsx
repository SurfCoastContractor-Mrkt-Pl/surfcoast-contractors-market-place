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

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #D0D0D2", borderTop: "3px solid " + T.dark, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!contractor) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 32, paddingBottom: 32, paddingLeft: 16, paddingRight: 16, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", background: T.card, border: "0.5px solid " + T.border, borderRadius: 10, boxShadow: T.shadow, overflow: "hidden" }}>
          <div style={{ padding: 24, borderBottom: "0.5px solid " + T.border }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: T.dark, margin: 0, fontStyle: "italic" }}>Contractor Profile Required</h2>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: T.muted, fontStyle: "italic" }}>
              You need to complete your contractor profile to access service templates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 32, paddingBottom: 32, paddingLeft: 16, paddingRight: 16, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 896, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.4rem)", fontWeight: 800, color: T.dark, margin: 0, fontStyle: "italic" }}>Service Management</h1>
          <p style={{ color: T.muted, marginTop: 8, fontStyle: "italic" }}>
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