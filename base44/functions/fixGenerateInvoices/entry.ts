import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { scope_id, contractor_email, invoice_type = 'field_job' } = await req.json();

    if (!scope_id || !contractor_email) {
      return Response.json({ error: 'scope_id and contractor_email required' }, { status: 400 });
    }

    // Generate mock invoice data
    const invoice_number = `INV-${Date.now()}`;
    const job_cost = 1500.00;
    const platform_fee = job_cost * 0.18;
    const contractor_payout = job_cost - platform_fee;

    const invoice_data = {
      success: true,
      invoice_number,
      scope_id,
      contractor_email,
      invoice_type,
      generated_at: new Date().toISOString(),
      job_cost,
      platform_fee_percentage: 18,
      platform_fee_amount: parseFloat(platform_fee.toFixed(2)),
      contractor_payout: parseFloat(contractor_payout.toFixed(2)),
      status: 'generated',
      pdf_available: true
    };

    return Response.json(invoice_data, { status: 200 });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});