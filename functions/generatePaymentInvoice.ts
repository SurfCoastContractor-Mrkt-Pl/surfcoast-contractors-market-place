import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { paymentId } = await req.json();

    if (!paymentId) {
      return Response.json({ error: 'paymentId required' }, { status: 400 });
    }

    // Must be authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch payment
    const payment = await base44.asServiceRole.entities.Payment.get(paymentId);
    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }

    const invoiceDate = new Date(payment.created_date);
    const invoiceNumber = `INV-${payment.id.substring(0, 8).toUpperCase()}-${invoiceDate.getFullYear()}`;

    // Generate PDF with jsPDF
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 50;
    let y = 50;

    // Header bar
    doc.setFillColor(31, 41, 55); // slate-900
    doc.rect(0, 0, pageW, 80, 'F');

    // Logo text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(251, 191, 36); // amber-400
    doc.text('SurfCoast', margin, 38);
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('Contractor Market Place', margin, 56);

    // INVOICE label top right
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(251, 191, 36);
    doc.text('INVOICE', pageW - margin, 50, { align: 'right' });

    y = 110;

    // Invoice meta box
    doc.setFillColor(249, 250, 251); // gray-50
    doc.roundedRect(margin, y, pageW - margin * 2, 70, 6, 6, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text('INVOICE NUMBER', margin + 15, y + 18);
    doc.text('INVOICE DATE', margin + 180, y + 18);
    doc.text('PAYMENT STATUS', margin + 330, y + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text(invoiceNumber, margin + 15, y + 40);
    doc.text(invoiceDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), margin + 180, y + 40);

    if (payment.status === 'confirmed') {
      doc.setTextColor(5, 150, 105); // green
      doc.text('✓ PAID', margin + 330, y + 40);
    } else {
      doc.setTextColor(217, 119, 6); // amber
      doc.text('PENDING', margin + 330, y + 40);
    }

    y += 95;

    // Bill To section
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text('BILL TO', margin, y);
    y += 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(31, 41, 55);
    doc.text(payment.payer_name || 'Customer', margin, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text(payment.payer_email || '', margin, y);
    y += 10;
    doc.text(`Account Type: ${payment.payer_type ? payment.payer_type.charAt(0).toUpperCase() + payment.payer_type.slice(1) : ''}`, margin, y);

    y += 30;

    // Table header
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, pageW - margin * 2, 28, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text('Description', margin + 12, y + 18);
    doc.text('Amount', pageW - margin - 12, y + 18, { align: 'right' });

    y += 28;

    // Table row
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, pageW - margin * 2, 36, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.rect(margin, y, pageW - margin * 2, 36, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    const purposeText = payment.purpose || 'SurfCoast Platform Access Fee';
    doc.text(purposeText, margin + 12, y + 22);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${(payment.amount || 0).toFixed(2)}`, pageW - margin - 12, y + 22, { align: 'right' });

    y += 50;

    // Summary box
    const summaryX = pageW - margin - 200;
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(summaryX, y, 200, 90, 6, 6, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('Subtotal', summaryX + 12, y + 22);
    doc.setTextColor(31, 41, 55);
    doc.text(`$${(payment.amount || 0).toFixed(2)}`, summaryX + 188, y + 22, { align: 'right' });

    doc.setTextColor(107, 114, 128);
    doc.text('Tax', summaryX + 12, y + 40);
    doc.setTextColor(31, 41, 55);
    doc.text('$0.00', summaryX + 188, y + 40, { align: 'right' });

    // Total line
    doc.setDrawColor(229, 231, 235);
    doc.line(summaryX + 12, y + 52, summaryX + 188, y + 52);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text('Total', summaryX + 12, y + 70);
    doc.setTextColor(5, 150, 105);
    doc.text(`$${(payment.amount || 0).toFixed(2)}`, summaryX + 188, y + 70, { align: 'right' });

    y += 115;

    // Footer
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageW - margin, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    const footerNote = 'This fee is disclosed as required by California SB 478 (Honest Pricing Law). It covers platform access and secure identity-verified contractor services.';
    const footerLines = doc.splitTextToSize(footerNote, pageW - margin * 2);
    doc.text(footerLines, margin, y);
    y += footerLines.length * 11 + 8;
    doc.text(`Payment Reference: ${payment.id}  |  Generated: ${new Date().toLocaleString('en-US')}`, margin, y);

    // Output as ArrayBuffer
    const pdfBytes = doc.output('arraybuffer');

    console.log(`PDF invoice generated: ${invoiceNumber} for payment ${paymentId}`);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoiceNumber}.pdf"`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Invoice generation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});