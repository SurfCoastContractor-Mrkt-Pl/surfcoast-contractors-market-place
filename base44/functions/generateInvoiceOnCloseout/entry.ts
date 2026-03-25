import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data } = body;

    // Authorization: internal automation only. Require valid internal service key.
    const internalKey = req.headers.get('x-internal-service-key');
    const expectedKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    
    if (!expectedKey || !internalKey || internalKey !== expectedKey) {
      console.warn('Unauthorized invoice generation attempt - invalid or missing service key');
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate this is a proper automation payload
    if (!event?.type || !event?.entity_name || event.entity_name !== 'ScopeOfWork') {
      return Response.json({ error: 'Invalid automation payload' }, { status: 400 });
    }

    // Only process when status changes to 'closed'
    if (event?.type !== 'update' || data?.status !== 'closed') {
      return Response.json({ success: true, message: 'Not a closeout event' });
    }

    const scopeId = event?.entity_id;
    if (!scopeId) {
      return Response.json({ error: 'Missing scope ID' }, { status: 400 });
    }

    // Fetch the complete scope record
    let scope;
    try {
      const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ id: scopeId });
      scope = scopes?.[0];
    } catch (e) {
      console.error('Error fetching scope:', e.message);
      scope = data; // Use event data as fallback
    }

    if (!scope) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    // Generate PDF invoice
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(45, 52, 54);
    doc.text('INVOICE', 20, yPos);

    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    yPos += 15;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos);
    yPos += 7;
    doc.text(`Job ID: ${scope.job_id || 'N/A'}`, 20, yPos);
    yPos += 7;
    doc.text(`Scope ID: ${scopeId}`, 20, yPos);

    // Job title
    yPos += 12;
    doc.setFontSize(14);
    doc.setTextColor(45, 52, 54);
    doc.text(scope.job_title || 'Untitled Project', 20, yPos);

    // Contractor info
    yPos += 12;
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text('Contractor:', 20, yPos);
    doc.setFontSize(10);
    yPos += 6;
    doc.text(scope.contractor_name || 'N/A', 20, yPos);
    doc.text(scope.contractor_email || 'N/A', 20, yPos + 5);

    // Customer info
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text('Client:', 120, yPos - 6);
    doc.setFontSize(10);
    doc.text(scope.customer_name || 'N/A', 120, yPos);
    doc.text(scope.customer_email || 'N/A', 120, yPos + 5);

    // Scope details section
    yPos += 20;
    doc.setFontSize(12);
    doc.setTextColor(45, 52, 54);
    doc.text('Work Summary', 20, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    if (scope.scope_summary) {
      const summaryLines = doc.splitTextToSize(scope.scope_summary, pageWidth - 40);
      doc.text(summaryLines, 20, yPos);
      yPos += summaryLines.length * 5 + 5;
    }

    // Cost breakdown
    yPos += 5;
    doc.setFontSize(12);
    doc.setTextColor(45, 52, 54);
    doc.text('Cost Breakdown', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);

    // Draw cost table
    const tableLeft = 20;
    const tableRight = pageWidth - 20;
    const colWidth = (tableRight - tableLeft) / 2;

    doc.text('Cost Type:', tableLeft, yPos);
    doc.text(scope.cost_type === 'hourly' ? 'Hourly Rate' : 'Fixed Price', tableLeft + colWidth, yPos);

    yPos += 8;
    doc.text('Amount:', tableLeft, yPos);
    doc.text(`$${scope.cost_amount?.toFixed(2) || '0.00'}`, tableLeft + colWidth, yPos);

    let totalCost = scope.cost_amount;
    if (scope.cost_type === 'hourly' && scope.estimated_hours) {
      yPos += 8;
      doc.text('Estimated Hours:', tableLeft, yPos);
      doc.text(`${scope.estimated_hours} hours`, tableLeft + colWidth, yPos);

      yPos += 8;
      doc.text('Total Cost:', tableLeft, yPos);
      totalCost = scope.cost_amount * scope.estimated_hours;
      doc.setTextColor(220, 78, 0);
      doc.setFontSize(11);
      doc.text(`$${totalCost.toFixed(2)}`, tableLeft + colWidth, yPos);
    } else {
      yPos += 8;
      doc.text('Total Cost:', tableLeft, yPos);
      doc.setTextColor(220, 78, 0);
      doc.setFontSize(11);
      doc.text(`$${totalCost.toFixed(2)}`, tableLeft + colWidth, yPos);
    }

    // Platform fee
    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const platformFeePercentage = scope.platform_fee_percentage || 3;
    const platformFee = (totalCost * platformFeePercentage) / 100;
    doc.text('Platform Facilitation Fee:', tableLeft, yPos);
    doc.text(`-$${platformFee.toFixed(2)} (${platformFeePercentage}%)`, tableLeft + colWidth, yPos);

    // Contractor payout
    yPos += 8;
    const contractorPayout = totalCost - platformFee;
    doc.setFontSize(11);
    doc.setTextColor(34, 197, 94); // Green for payout
    doc.text('Contractor Payout:', tableLeft, yPos);
    doc.text(`$${contractorPayout.toFixed(2)}`, tableLeft + colWidth, yPos);

    // Work date
    yPos += 12;
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.text('Work Date:', tableLeft, yPos);
    doc.text(scope.agreed_work_date || 'TBD', tableLeft + colWidth, yPos);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('© SurfCoast Contractor Market Place', 20, pageHeight - 10);

    const pdfBytes = doc.output('arraybuffer');
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    // Upload PDF to storage
    let fileUrl = '';
    try {
      const uploadRes = await base44.integrations.Core.UploadFile({
        file: `data:application/pdf;base64,${pdfBase64}`,
      });
      fileUrl = uploadRes.file_url;
    } catch (e) {
      console.error('Error uploading PDF:', e.message);
      fileUrl = ''; // Continue without file
    }

    // Send email to contractor
    try {
      const jobCost = scope.cost_type === 'hourly' ? scope.cost_amount * scope.estimated_hours : scope.cost_amount;
      const platformFeePercentage = scope.platform_fee_percentage || 3;
      const platformFee = (jobCost * platformFeePercentage) / 100;
      const payoutAmount = jobCost - platformFee;
      await base44.integrations.Core.SendEmail({
        to: scope.contractor_email,
        subject: `Invoice: ${scope.job_title}`,
        body: `Hello ${scope.contractor_name},\n\nYour job "${scope.job_title}" has been closed out.\n\nJob Amount: $${jobCost.toFixed(2)}\nPlatform Facilitation Fee (${platformFeePercentage}%): -$${platformFee.toFixed(2)}\nYour Payout: $${payoutAmount.toFixed(2)}\n\nThank you for your work!\n\nSurfCoast Contractor Market Place`,
      });
    } catch (e) {
      console.error('Error sending email to contractor:', e.message);
    }

    // Send email to client
    try {
      const jobCost = scope.cost_type === 'hourly' ? scope.cost_amount * scope.estimated_hours : scope.cost_amount;
      await base44.integrations.Core.SendEmail({
        to: scope.customer_email,
        subject: `Invoice: ${scope.job_title}`,
        body: `Hello ${scope.customer_name},\n\nYour job "${scope.job_title}" has been completed.\n\nTotal Amount: $${jobCost.toFixed(2)}\n\nThank you for using SurfCoast!\n\nSurfCoast Contractor Market Place`,
      });
    } catch (e) {
      console.error('Error sending email to client:', e.message);
    }

    return Response.json({ 
      success: true, 
      message: 'Invoice generated and emailed',
      fileUrl 
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});