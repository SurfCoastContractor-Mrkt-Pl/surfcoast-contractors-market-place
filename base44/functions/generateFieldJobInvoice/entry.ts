import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scope_id } = await req.json();

    if (!scope_id) {
      return Response.json({ error: 'Missing scope_id' }, { status: 400 });
    }

    // Fetch the scope of work
    const scope = await base44.asServiceRole.entities.ScopeOfWork.get(scope_id);

    if (!scope) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    // Verify user is the contractor
    if (scope.contractor_email !== user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Generate PDF invoice
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(30, 90, 150);
    doc.text('INVOICE', margin, margin + 10);

    // Invoice number and date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Invoice #: SC-${scope.id?.slice(0, 8).toUpperCase()}`, pageWidth - margin - 50, margin + 10);
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - margin - 50, margin + 20);

    // Contractor info (From)
    let yPos = margin + 35;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('FROM:', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.text(scope.contractor_name || 'Contractor', margin, yPos);
    yPos += lineHeight;
    doc.setTextColor(100, 100, 100);
    doc.text(scope.contractor_email, margin, yPos);
    yPos += lineHeight;

    // Client info (Bill To)
    yPos += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text('BILL TO:', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.text(scope.client_name || 'Client', margin, yPos);
    yPos += lineHeight;
    doc.setTextColor(100, 100, 100);
    doc.text(scope.client_email || '', margin, yPos);
    yPos += lineHeight;

    // Job details
    yPos += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text('JOB DETAILS:', margin, yPos);
    yPos += lineHeight;

    const jobDetailsX = margin;
    const jobDetailsWidth = pageWidth - 2 * margin;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const jobLines = doc.splitTextToSize(scope.job_title || 'Job', jobDetailsWidth - 10);
    doc.text(jobLines, jobDetailsX, yPos);
    yPos += jobLines.length * lineHeight + 4;

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    if (scope.agreed_work_date) {
      doc.text(`Completion Date: ${new Date(scope.agreed_work_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, jobDetailsX, yPos);
      yPos += lineHeight;
    }

    if (scope.scope_summary) {
      doc.text('Scope:', jobDetailsX, yPos);
      yPos += lineHeight;
      const scopeLines = doc.splitTextToSize(scope.scope_summary, jobDetailsWidth - 10);
      doc.text(scopeLines, jobDetailsX + 5, yPos);
      yPos += scopeLines.length * lineHeight + 4;
    }

    // Line items table
    yPos += 8;
    const tableStartY = yPos;
    const tableLeft = margin;
    const tableRight = pageWidth - margin;
    const colWidths = {
      description: tableRight - tableLeft - 80,
      amount: 40
    };

    // Table header
    doc.setFillColor(30, 90, 150);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.rect(tableLeft, tableStartY, tableRight - tableLeft, 8, 'F');
    doc.text('Description', tableLeft + 5, tableStartY + 6);
    doc.text('Amount', tableRight - 45, tableStartY + 6);

    // Line item
    yPos = tableStartY + 12;
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    const description = scope.cost_type === 'hourly'
      ? `${scope.job_title} (${scope.estimated_hours || 'agreed'} hours @ $${scope.cost_amount}/hr)`
      : scope.job_title;
    
    const descLines = doc.splitTextToSize(description, colWidths.description);
    doc.text(descLines, tableLeft + 5, yPos);
    doc.text(`$${scope.cost_amount?.toLocaleString()}`, tableRight - 45, yPos);

    yPos += Math.max(descLines.length * lineHeight, lineHeight) + 4;

    // Totals section
    const totalTop = yPos + 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(tableLeft, totalTop, tableRight, totalTop);

    yPos = totalTop + 8;
    doc.setFontSize(10);
    doc.text('Subtotal:', tableRight - 80, yPos);
    doc.text(`$${scope.cost_amount?.toLocaleString()}`, tableRight - 45, yPos);

    yPos += lineHeight + 2;
    doc.setTextColor(180, 0, 0);
    const platformFee = (scope.cost_amount * 0.18).toFixed(2);
    doc.text('Platform Fee (18%):', tableRight - 80, yPos);
    doc.text(`-$${platformFee}`, tableRight - 45, yPos);

    yPos += lineHeight + 6;
    doc.setFillColor(245, 245, 245);
    doc.rect(tableRight - 120, yPos - 4, 120, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    const payout = (scope.cost_amount * 0.82).toFixed(2);
    doc.text('Total Due:', tableRight - 80, yPos + 2);
    doc.text(`$${parseFloat(payout).toLocaleString()}`, tableRight - 45, yPos + 2);

    // Footer
    yPos = pageHeight - margin - 20;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for using SurfCoast Marketplace. For inquiries, contact support@surfcoast.com', margin, yPos);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, margin, yPos + 5);

    // Upload PDF to storage and return a URL (frontend cannot handle raw binary via SDK)
    const pdfBytes = doc.output('arraybuffer');
    const fileName = `invoice_${scope.id}_${Date.now()}.pdf`;
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', pdfBlob, fileName);

    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: pdfBlob });
    const pdfUrl = uploadResult?.file_url;

    if (!pdfUrl) {
      return Response.json({ error: 'Failed to upload invoice PDF' }, { status: 500 });
    }

    return Response.json({
      success: true,
      pdfUrl,
      invoiceId: `SC-${scope.id?.slice(0, 8).toUpperCase()}`,
    });

  } catch (error) {
    console.error('Invoice generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});