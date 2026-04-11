import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const serviceKey = req.headers.get('x-internal-key');
    const validServiceKey = serviceKey && serviceKey === Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!validServiceKey) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin or internal service access required' }, { status: 403 });
      }
    }
    const { scopeId, contractorId } = await req.json();

    const scope = await base44.asServiceRole.entities.ScopeOfWork.get(scopeId);
    const contractor = await base44.asServiceRole.entities.Contractor.get(contractorId);

    if (!scope || !contractor) {
      return Response.json({ error: 'Scope or contractor not found' }, { status: 404 });
    }

    // Calculate invoice details
    const subtotal = scope.cost_amount || 0;
    const platformFee = (subtotal * 0.18).toFixed(2); // 18% facilitation fee
    const total = (subtotal - platformFee).toFixed(2);

    // Generate invoice PDF
    const invoiceHTML = `
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Invoice</h2>
        <p><strong>From:</strong> SurfCoast</p>
        <p><strong>To:</strong> ${contractor.name}</p>
        <p><strong>Project:</strong> ${scope.job_title}</p>
        <hr>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td><strong>Description</strong></td>
            <td style="text-align: right;"><strong>Amount</strong></td>
          </tr>
          <tr>
            <td>${scope.scope_summary}</td>
            <td style="text-align: right;">$${subtotal.toFixed(2)}</td>
          </tr>
          <tr style="border-top: 1px solid #ccc; padding-top: 10px;">
            <td><strong>Platform Fee (18%)</strong></td>
            <td style="text-align: right;">-$${platformFee}</td>
          </tr>
          <tr style="background-color: #f0f0f0; font-weight: bold;">
            <td><strong>Total to Contractor</strong></td>
            <td style="text-align: right;">$${total}</td>
          </tr>
        </table>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          Invoice generated on ${new Date().toLocaleDateString()}
        </p>
      </body>
      </html>
    `;

    // Upload invoice as file
    const invoiceFile = new Blob([invoiceHTML], { type: 'text/html' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file: invoiceFile });

    // Send invoice email
    await base44.integrations.Core.SendEmail({
      to: contractor.email,
      subject: `Invoice for ${scope.job_title}`,
      body: `Your invoice for the completed job "${scope.job_title}" is ready.\n\nSubtotal: $${subtotal.toFixed(2)}\nPlatform Fee: -$${platformFee}\nTotal: $${total}\n\nInvoice: ${file_url}`,
    });

    console.log(`Invoice generated for scope ${scopeId}`);
    return Response.json({ success: true, invoiceUrl: file_url, total });
  } catch (error) {
    console.error('Invoice generation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});