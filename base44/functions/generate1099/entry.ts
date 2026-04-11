import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    const { contractorId, year } = await req.json();

    if (!contractorId || !year) {
      return Response.json({ error: 'Contractor ID and year required' }, { status: 400 });
    }

    // Get contractor
    const contractors = await base44.entities.Contractor.filter({ id: contractorId });
    if (!contractors?.[0]) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const contractor = contractors[0];

    // Get all payments for contractor in that year
    const payments = await base44.entities.ScopeOfWork.filter({
      contractor_email: contractor.email,
      status: 'closed',
    });

    const yearStart = new Date(`${year}-01-01`);
    const yearEnd = new Date(`${year}-12-31`);

    const yearPayments = (payments || []).filter(p => {
      const closedDate = new Date(p.closed_date || p.created_date);
      return closedDate >= yearStart && closedDate <= yearEnd;
    });

    // Calculate totals
    const totalGross = yearPayments.reduce((sum, p) => sum + (p.cost_amount || 0), 0);
    const totalFees = yearPayments.reduce((sum, p) => {
      const fee = (p.cost_amount || 0) * (p.platform_fee_percentage || 0.18);
      return sum + fee;
    }, 0);
    const netIncome = totalGross - totalFees;

    // Generate 1099-NEC form data
    const form1099 = {
      form_type: '1099-NEC',
      tax_year: year,
      contractor_name: contractor.name,
      contractor_ssn: 'REDACTED', // In production, get from secure storage
      contractor_address: contractor.location,
      contractor_email: contractor.email,
      recipient_name: 'SurfCoast Platform',
      recipient_tin: '00-0000000', // Placeholder
      box_1_misc_income: netIncome,
      box_2_federal_withheld: 0,
      total_payments: yearPayments.length,
      payment_transactions: yearPayments.map(p => ({
        date: p.closed_date || p.created_date,
        amount: p.cost_amount,
        description: p.job_title,
      })),
      generated_at: new Date().toISOString(),
      signature_line: `Generated on ${new Date().toLocaleDateString()}`,
    };

    // In production, integrate with PDF generation library
    return Response.json({
      form1099,
      pdfUrl: null, // Would contain actual PDF URL
      csvUrl: null, // Would contain CSV export
      message: '1099-NEC data generated successfully',
    });
  } catch (error) {
    console.error('Generate 1099 error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});