import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import PeerAgreementModal from './PeerAgreementModal';
import PaymentComplianceWarning from './PaymentComplianceWarning';

export default function CollaborationDashboard({ user }) {
  const [selectedCollab, setSelectedCollab] = useState(null);
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);

  const { data: collaborations = [], isLoading } = useQuery({
    queryKey: ['collaborations', user?.email],
    queryFn: async () => {
      const allCollabs = await base44.entities.ProjectCollaboration.filter({
        collaborators: { $elemMatch: { contractor_email: user?.email } }
      });
      return allCollabs || [];
    },
    enabled: !!user?.email
  });

  if (isLoading) {
    return <div className="p-4">Loading collaborations...</div>;
  }

  if (!collaborations || collaborations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">No active collaborations yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PaymentComplianceWarning contractor={user} />

      {collaborations.map(collab => {
        const myRole = collab.collaborators.find(c => c.contractor_email === user?.email);
        const otherCollaborators = collab.collaborators.filter(
          c => c.contractor_email !== user?.email
        );

        return (
          <Card key={collab.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{collab.project_name}</h3>
                  <p className="text-sm text-slate-600">
                    {collab.collaborators.length} collaborator{collab.collaborators.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {collab.status === 'active' && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  )}
                  {collab.status === 'forming' && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Forming
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">COLLABORATORS</p>
                  <div className="space-y-2">
                    {collab.collaborators.map(collaborator => (
                      <div key={collaborator.contractor_email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{collaborator.contractor_name}</p>
                          <p className="text-xs text-slate-600">{collaborator.contractor_email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {collaborator.agreement_signed_at && (
                            <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                              <FileCheck className="w-3 h-3" />
                              Agreed
                            </span>
                          )}
                          {!collaborator.agreement_signed_at && (
                            <span className="text-yellow-600 text-xs font-medium">Pending</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {myRole && !myRole.agreement_signed_at && (
                  <Button
                    onClick={() => {
                      setSelectedCollab(collab);
                      setAgreementModalOpen(true);
                    }}
                    className="w-full"
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    Sign Peer Agreement
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}

      {selectedCollab && (
        <PeerAgreementModal
          open={agreementModalOpen}
          onClose={() => {
            setAgreementModalOpen(false);
            setSelectedCollab(null);
          }}
          collaborationId={selectedCollab.id}
          contractorEmail={user?.email}
          contractorName={user?.full_name}
        />
      )}
    </div>
  );
}