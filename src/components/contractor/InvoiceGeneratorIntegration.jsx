import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function InvoiceGeneratorIntegration({ scope_id, contractor_email, onInvoiceGenerated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleGenerateInvoice = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await base44.functions.invoke('fixGenerateInvoices', {
        scope_id,
        contractor_email,
        invoice_type: 'field_job'
      });

      if (response.data?.success) {
        setSuccess(`Invoice ${response.data.invoice_number} generated successfully`);
        onInvoiceGenerated?.(response.data);
      } else {
        setError('Failed to generate invoice');
      }
    } catch (err) {
      setError(err.message || 'Error generating invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleGenerateInvoice}
        disabled={loading}
        className="gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        {loading ? 'Generating...' : 'Generate Invoice'}
      </Button>
      {error && <div className="flex gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
      {success && <div className="flex gap-2 text-green-600 text-sm"><CheckCircle2 className="w-4 h-4" />{success}</div>}
    </div>
  );
}