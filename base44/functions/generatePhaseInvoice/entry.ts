import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { progressPaymentId } = await req.json();
    if (!progressPaymentId) {
      return Response.json({ error: 'progressPaymentId is required' }, { status: 400 });
    }

    // Fetch the progress payment
    const payments = await base44.asServiceRole.entities.ProgressPayment.filter({ id: progressPaymentId });
    const payment = payments?.[0];
    if (!payment) {
      return Response.json({ error: 'Progress payment not found' }, { status: 404 });
    }

    // Only contractor, customer, or admin can generate
    const isAuthorized =
      user.email.toLowerCase() === payment.contractor_email?.toLowerCase() ||
      user.email.toLowerCase() === payment.customer_email?.toLowerCase() ||
      user.role === 'admin';

    if (!isAuthorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch scope for additional project context
    let scope = null;
    if (payment.scope_id) {
      const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ id: payment.scope_id });
      scope = scopes?.[0] || null;
    }

    // Build invoice details
    const invoiceNumber = `INV-${progressPaymentId.substring(0, 8).toUpperCase()}-P${payment.phase_number}`;
    const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const approvedDate = payment.customer_approved_date
      ? new Date(payment.customer_approved_date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : invoiceDate;
    const completedDate = payment.contractor_completed_date
      ? new Date(payment.contractor_completed_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'N/A';

    // ── PDF Generation ──
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const rightCol = pageWidth / 2 + 10;
    let y = margin;

    // Brand header bar
    doc.setFillColor(217, 119, 6); // amber-600
    doc.rect(0, 0, pageWidth, 14, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('SurfCoast Contractor Market Place', margin, 9.5);
    doc.text('PHASE PAYMENT INVOICE', pageWidth - margin, 9.5, { align: 'right' });

    y = 26;

    // Invoice meta (right side)
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Invoice #: ${invoiceNumber}`, pageWidth - margin, y, { align: 'right' });
    y += 5;
    doc.text(`Issue Date: ${invoiceDate}`, pageWidth - margin, y, { align: 'right' });
    y += 5;
    doc.text(`Payment Approved: ${approvedDate}`, pageWidth - margin, y, { align: 'right' });

    // Parties
    y = 26;
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text('FROM (CONTRACTOR)', margin, y);
    y += 5;
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(payment.contractor_email?.split('@')[0] || 'Contractor', margin, y);
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(payment.contractor_email || '', margin, y);

    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text('BILLED TO (CUSTOMER)', margin, y);
    y += 5;
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(payment.customer_email?.split('@')[0] || 'Customer', margin, y);
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(payment.customer_email || '', margin, y);

    y += 14;

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Project details section
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.text('PROJECT DETAILS', margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);

    const projectTitle = scope?.job_title || 'Project';
    doc.text(`Project: ${projectTitle}`, margin, y);
    y += 5;

    if (scope?.agreed_work_date) {
      const workDate = new Date(scope.agreed_work_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`Agreed Work Date: ${workDate}`, margin, y);
      y += 5;
    }

    doc.text(`Phase Completed Date: ${completedDate}`, margin, y);
    y += 14;

    // Phase summary box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 8, 1, 1, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('WORK PERFORMED', margin + 4, y + 5.5);
    y += 14;

    // Phase title + number
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(`Phase ${payment.phase_number}: ${payment.phase_title}`, margin, y);
    y += 6;

    // Work description
    if (payment.description) {
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const descLines = doc.splitTextToSize(payment.description, pageWidth - 2 * margin);
      doc.text(descLines, margin, y);
      y += descLines.length * 5 + 4;
    }

    // Contractor notes
    if (payment.contractor_completion_notes) {
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.text('Contractor Notes:', margin, y);
      y += 4;
      doc.setTextColor(80, 80, 80);
      const noteLines = doc.splitTextToSize(payment.contractor_completion_notes, pageWidth - 2 * margin);
      doc.text(noteLines, margin, y);
      y += noteLines.length * 4 + 4;
    }

    // Customer approval notes
    if (payment.customer_approval_notes) {
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.text('Customer Approval Notes:', margin, y);
      y += 4;
      doc.setTextColor(80, 80, 80);
      const approvalLines = doc.splitTextToSize(payment.customer_approval_notes, pageWidth - 2 * margin);
      doc.text(approvalLines, margin, y);
      y += approvalLines.length * 4 + 6;
    }

    y += 4;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Payment summary table
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 8, 1, 1, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('PAYMENT SUMMARY', margin + 4, y + 5.5);
    y += 14;

    // Table header row
    const col1 = margin;
    const col2 = pageWidth - margin - 60;
    const col3 = pageWidth - margin - 25;
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text('Description', col1, y);
    doc.text('Qty', col2, y);
    doc.text('Amount', col3, y, { align: 'right' });
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // Table row
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(`Phase ${payment.phase_number} — ${payment.phase_title}`, col1, y);
    doc.text('1', col2, y);
    doc.text(`$${Number(payment.amount).toFixed(2)}`, col3, y, { align: 'right' });
    y += 8;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Total
    doc.setFontSize(12);
    doc.setTextColor(217, 119, 6);
    doc.text('TOTAL DUE:', col2, y);
    doc.setTextColor(30, 30, 30);
    doc.text(`$${Number(payment.amount).toFixed(2)}`, col3, y, { align: 'right' });
    y += 6;

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Payment Status: APPROVED & PAID`, col2, y);
    y += 12;

    // Footer
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for using SurfCoast Contractor Market Place. This is an auto-generated invoice.', pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.text(`Invoice ID: ${invoiceNumber}`, pageWidth / 2, pageHeight - 7, { align: 'center' });

    // Upload PDF
    const pdfBytes = doc.output('arraybuffer');
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: pdfBlob });
    const pdfUrl = uploadResult.file_url;

    // Email both parties
    const emailSubject = `Phase ${payment.phase_number} Invoice — ${projectTitle}`;
    const emailBody = (name) =>
      `Hello ${name},\n\nPhase ${payment.phase_number} ("${payment.phase_title}") has been approved and payment of $${Number(payment.amount).toFixed(2)} has been released.\n\nYour invoice is available here:\n${pdfUrl}\n\nInvoice #: ${invoiceNumber}\nApproved: ${approvedDate}\n\nThank you,\nSurfCoast Contractor Market Place`;

    await Promise.all([
      base44.asServiceRole.integrations.Core.SendEmail({
        to: payment.customer_email,
        from_name: 'SurfCoast',
        subject: emailSubject,
        body: emailBody('Customer'),
      }),
      base44.asServiceRole.integrations.Core.SendEmail({
        to: payment.contractor_email,
        from_name: 'SurfCoast',
        subject: emailSubject,
        body: emailBody('Contractor'),
      }),
    ]);

    console.log(`Phase invoice generated: ${invoiceNumber} for progressPaymentId=${progressPaymentId}`);

    return Response.json({ success: true, pdfUrl, invoiceNumber });
  } catch (error) {
    console.error('generatePhaseInvoice error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});