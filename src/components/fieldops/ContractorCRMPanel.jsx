import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, MessageCircle, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import useTierAccess from '@/hooks/useTierAccess';

export default function ContractorCRMPanel({ contractorEmail, crmLevel }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');

  const queryClient = useQueryClient();
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['crm-customers', contractorEmail],
    queryFn: () => base44.entities.ContractorCustomerProfile.filter({ contractor_email: contractorEmail }),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ContractorCustomerProfile.update(data.id, { contractor_notes: data.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-customers', contractorEmail] });
      setIsOpen(false);
    },
  });

  if (crmLevel === 'none') {
    return (
      <Card className="text-center py-8 border-dashed">
        <p className="text-muted-foreground">CRM features are available on Licensed and Premium tiers.</p>
      </Card>
    );
  }

  if (isLoading) return <div className="text-center py-8">Loading customers...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Customer Relationship Management</h3>

      <div className="grid gap-4">
        {customers.map((customer) => (
          <Card key={customer.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            setSelectedCustomer(customer);
            setNotes(customer.contractor_notes || '');
            setIsOpen(true);
          }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{customer.customer_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{customer.customer_email}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Total Spent</p>
                    <p className="font-semibold">${customer.total_spent || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Jobs</p>
                    <p className="font-semibold">{customer.total_jobs || 0}</p>
                  </div>
                </div>
                {crmLevel === 'advanced' && customer.last_service_date && (
                  <div>
                    <p className="text-muted-foreground">Last Service</p>
                    <p className="font-semibold text-xs">{customer.last_service_date}</p>
                  </div>
                )}
              </div>
              {crmLevel === 'basic' && customer.contractor_notes && (
                <p className="mt-3 text-sm text-muted-foreground italic">"{customer.contractor_notes}"</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {customers.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-muted-foreground">No customers yet. Completed jobs will appear here.</p>
        </Card>
      )}

      {selectedCustomer && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedCustomer.customer_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedCustomer.customer_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Spent</p>
                  <p className="font-medium">${selectedCustomer.total_spent || 0}</p>
                </div>
                {selectedCustomer.customer_phone && (
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedCustomer.customer_phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Jobs Completed</p>
                  <p className="font-medium">{selectedCustomer.total_jobs || 0}</p>
                </div>
              </div>

              {crmLevel !== 'none' && (
                <>
                  <Textarea
                    placeholder="Add private notes about this customer"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-24"
                  />
                  <Button
                    onClick={() => updateMutation.mutate({ id: selectedCustomer.id, notes })}
                    className="w-full"
                  >
                    Save Notes
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}