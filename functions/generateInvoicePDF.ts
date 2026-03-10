import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { scope_id } = await req.json();

    if (!scope_id) {
      return Response.json({ error: 'scope_id is required' }, { status: 400 });
    }

    // Fetch scope of work details
    const scope = await base44.asServiceRole.entities.ScopeOfWork.list();
    const scopeData = scope.find(s => s.id === scope_id);

    if (!scopeData) {
      return Response.json({ error: 'Scope of work not found' }, { status: 404 });
    }

    if (scopeData.status !== 'closed') {
      return Response.json({ error: 'Job must be closed to generate invoice' }, { status: 400 });
    }

    // Calculate total amount
    const totalAmount = scopeData.cost_type === 'hourly' 
      ? (scopeData.cost_amount * (scopeData.estimated_hours || 0))
      : scopeData.cost_amount;

    // Generate PDF invoice
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(51, 51, 51);
    doc.text('INVOICE', margin, yPos);
    yPos += 15;

    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const invoiceDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Date: ${invoiceDate}`, margin, yPos);
    yPos += 6;
    doc.text(`Invoice ID: ${scope_id.substring(0, 8).toUpperCase()}`, margin, yPos);
    yPos += 12;

    // Customer section
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    doc.text('BILL TO:', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(scopeData.customer_name, margin, yPos);
    yPos += 5;
    doc.setTextColor(100, 100, 100);
    doc.text(scopeData.customer_email, margin, yPos);
    yPos += 12;

    // Contractor section
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    doc.text('FROM:', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(scopeData.contractor_name, margin, yPos);
    yPos += 5;
    doc.setTextColor(100, 100, 100);
    doc.text(scopeData.contractor_email, margin, yPos);
    yPos += 15;

    // Job details
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    doc.text('JOB DETAILS:', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Job: ${scopeData.job_title}`, margin, yPos);
    yPos += 5;
    
    if (scopeData.agreed_work_date) {
      doc.text(`Work Date: ${new Date(scopeData.agreed_work_date).toLocaleDateString('en-US')}`, margin, yPos);
      yPos += 5;
    }

    doc.text(`Description: ${scopeData.scope_summary || 'N/A'}`, margin, yPos, { maxWidth: pageWidth - 2 * margin });
    yPos += 20;

    // Line items table
    const tableTop = yPos;
    const colWidth = (pageWidth - 2 * margin) / 3;
    const rowHeight = 8;

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    
    doc.text('Description', margin + 2, tableTop + 6);
    doc.text('Rate', margin + colWidth + 2, tableTop + 6);
    doc.text('Amount', margin + 2 * colWidth + 2, tableTop + 6);
    
    yPos = tableTop + rowHeight;

    // Table divider
    doc.setDrawColor(180, 180, 180);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 2;

    // Table row
    const description = scopeData.cost_type === 'hourly'
      ? `Labor (${scopeData.estimated_hours} hours @ $${scopeData.cost_amount.toFixed(2)}/hr)`
      : 'Scope of Work';

    doc.setTextColor(100, 100, 100);
    doc.text(description, margin + 2, yPos + 6);
    doc.text(`$${scopeData.cost_amount.toFixed(2)}`, margin + colWidth + 2, yPos + 6);
    doc.text(`$${totalAmount.toFixed(2)}`, margin + 2 * colWidth + 2, yPos + 6);
    
    yPos += rowHeight;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // Total
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text(`TOTAL: $${totalAmount.toFixed(2)}`, margin + 2 * colWidth - 20, yPos);

    yPos += 15;
    doc.setDrawColor(180, 180, 180);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business. SurfCoast Contractor Market Place', margin, pageHeight - 10, { align: 'center' });

    // Save PDF
    const pdfBytes = doc.output('arraybuffer');
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Upload PDF
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: pdfBlob });
    const pdfUrl = uploadResult.file_url;

    // Send email to customer
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: scopeData.customer_email,
      subject: `Invoice for ${scopeData.job_title} - ${invoiceDate}`,
      body: `Hello ${scopeData.customer_name},\n\nThank you for using SurfCoast! Your job with ${scopeData.contractor_name} is now complete.\n\nYour invoice is attached. Please review it and ensure all work meets your expectations.\n\nIf you have any questions, please contact us.\n\nBest regards,\nSurfCoast Contractor Market Place`,
    });

    // Send email to contractor
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: scopeData.contractor_email,
      subject: `Invoice Generated for ${scopeData.job_title} - ${invoiceDate}`,
      body: `Hello ${scopeData.contractor_name},\n\nYour job "${scopeData.job_title}" has been marked as complete. Your invoice has been generated and sent to the customer.\n\nInvoice Details:\n- Customer: ${scopeData.customer_name}\n- Total Amount: $${totalAmount.toFixed(2)}\n- Date: ${invoiceDate}\n\nThank you for your work!\n\nSurfCoast Contractor Market Place`,
    });

    console.log(`Invoice generated and sent for scope: ${scope_id}`);

    return Response.json({ 
      success: true, 
      pdfUrl,
      invoiceAmount: totalAmount,
      invoiceId: scope_id.substring(0, 8).toUpperCase()
    });
  } catch (error) {
    console.error('Invoice generation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});