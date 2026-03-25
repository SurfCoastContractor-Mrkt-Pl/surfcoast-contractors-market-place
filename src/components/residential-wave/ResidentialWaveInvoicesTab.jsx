import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Eye, Trash2, CreditCard } from 'lucide-react';
import InvoicePaymentModal from './InvoicePaymentModal';

export default function ResidentialWaveInvoicesTab({ userEmail }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: '',
    customer_name: '',
    customer_email: '',
    service_description: '',
    amount: '',
  });

  const queryClient = useQueryClient();

  const { data: invoices } = useQuery({
    queryKey: ['residentialWaveInvoices', userEmail],
    queryFn: () => base44.entities.ResidentialWaveInvoice.filter({ contractor_email: userEmail }),
    enabled: !!userEmail,
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (invoiceData) => base44.entities.ResidentialWaveInvoice.create({
      ...invoiceData,
      contractor_email: userEmail,
      contractor_id: userEmail,
      total_amount: parseFloat(invoiceData.amount),
      issue_date: new Date().toISOString().split('T')[0],
      status: 'draft',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentialWaveInvoices', userEmail] });
      setShowForm(false);
      setFormData({
        invoice_number: '',
        customer_name: '',
        customer_email: '',
        service_description: '',
        amount: '',
      });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (id) => base44.entities.ResidentialWaveInvoice.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentialWaveInvoices', userEmail] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createInvoiceMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Invoices</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Create New Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Invoice Number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              />
              <Input
                placeholder="Customer Name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
              <Input
                placeholder="Customer Email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              />
              <Input
                placeholder="Service Description"
                value={formData.service_description}
                onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
              />
              <Input
                placeholder="Amount ($)"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Create Invoice
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {invoices && invoices.length > 0 ? (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">INV-{invoice.invoice_number}</h3>
                    <p className="text-slate-600">{invoice.customer_name}</p>
                    <p className="text-sm text-slate-500">{invoice.service_description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">${invoice.total_amount?.toFixed(2) || '0.00'}</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded mt-2 inline-block ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteInvoiceMutation.mutate(invoice.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-50">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600">No invoices yet. Create your first invoice.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}