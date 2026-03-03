import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { paymentId } = await req.json();

    if (!paymentId) {
      return Response.json({ error: 'paymentId required' }, { status: 400 });
    }

    // Fetch payment
    let payment;
    try {
      payment = await base44.asServiceRole.entities.Payment.get(paymentId);
    } catch (error) {
      if (error.message && error.message.includes('not found')) {
        return Response.json({ error: 'Payment not found' }, { status: 404 });
      }
      throw error;
    }
    const invoiceDate = new Date(payment.created_date);
    const invoiceNumber = `INV-${payment.id.substring(0, 8).toUpperCase()}-${invoiceDate.getFullYear()}`;

    // Generate professional invoice HTML
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    header { border-bottom: 3px solid #1f2937; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #1f2937; }
    .invoice-title { font-size: 28px; font-weight: bold; color: #1f2937; margin: 20px 0 10px; }
    .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .detail-box { padding: 15px; background: #f9fafb; border-radius: 8px; }
    .detail-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px; }
    .detail-value { font-size: 16px; font-weight: 600; color: #1f2937; }
    table { width: 100%; margin: 30px 0; border-collapse: collapse; }
    th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .amount { text-align: right; }
    .summary { margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .summary-row.total { font-size: 18px; font-weight: bold; color: #1f2937; border-top: 2px solid #e5e7eb; padding-top: 10px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
    .status.confirmed { background: #d1fae5; color: #065f46; }
    .status.pending { background: #fef3c7; color: #92400e; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">🏗️ ContractorHub</div>
    </header>

    <h1 class="invoice-title">Invoice</h1>

    <div class="invoice-details">
      <div class="detail-box">
        <div class="detail-label">Invoice Number</div>
        <div class="detail-value">${invoiceNumber}</div>
      </div>
      <div class="detail-box">
        <div class="detail-label">Invoice Date</div>
        <div class="detail-value">${invoiceDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>

    <div class="invoice-details">
      <div class="detail-box">
        <div class="detail-label">Bill To</div>
        <div class="detail-value">${payment.payer_name}</div>
        <div style="color: #6b7280; margin-top: 5px;">${payment.payer_email}</div>
      </div>
      <div class="detail-box">
        <div class="detail-label">Account Type</div>
        <div class="detail-value" style="text-transform: capitalize;">${payment.payer_type}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${payment.purpose || 'ContractorHub Platform Access Fee'}</td>
          <td class="amount"><strong>$${(payment.amount || 0).toFixed(2)}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>$${(payment.amount || 0).toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Tax</span>
        <span>$0.00</span>
      </div>
      <div class="summary-row total">
        <span>Total Due</span>
        <span>$${(payment.amount || 0).toFixed(2)}</span>
      </div>
    </div>

    <div style="margin-top: 20px;">
      <span class="status ${payment.status === 'confirmed' ? 'confirmed' : 'pending'}">
        ${payment.status === 'confirmed' ? '✓ PAID' : '⏳ PENDING'}
      </span>
    </div>

    <div class="footer">
      <p>
        <strong>ContractorHub Platform Notice:</strong> This fee is disclosed as required by California SB 478 (Honest Pricing Law). 
        It covers platform access and secure identity-verified contractor services. Thank you for using ContractorHub.
      </p>
      <p style="margin-top: 15px;">
        Payment Reference: ${payment.id} | Generated: ${new Date().toLocaleString('en-US')}
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Send invoice via email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: payment.payer_email,
      subject: `Invoice ${invoiceNumber} — ContractorHub`,
      body: `Hello ${payment.payer_name},\n\nPlease see the attached invoice for your ContractorHub platform access fee.\n\nInvoice Number: ${invoiceNumber}\nAmount: $${(payment.amount || 0).toFixed(2)}\nStatus: ${payment.status === 'confirmed' ? 'PAID' : 'PENDING'}\nDate: ${invoiceDate.toLocaleDateString('en-US')}\n\nThis invoice is for your records. Thank you for using ContractorHub!\n\n(This is an automated invoice — do not reply to this email)`,
    });

    console.log(`Invoice generated: ${invoiceNumber} for payment ${paymentId}`);
    // Return both HTML and email notification
    return Response.json({ 
      success: true, 
      invoiceNumber, 
      invoiceHTML,
      message: 'Invoice emailed to ' + payment.payer_email
    });
  } catch (error) {
    console.error('Invoice generation error:', error.message);
    // Return 404 if payment not found, otherwise 500
    if (error.message && error.message.includes('not found')) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});