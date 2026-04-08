import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all closed scopes for the contractor
    const scopes = await base44.entities.ScopeOfWork.filter({
      contractor_email: user.email,
      status: 'closed'
    });

    // Build CSV data
    const csvHeaders = ['Invoice Number', 'Date', 'Customer Name', 'Amount', 'Description', 'Category'];
    const csvRows = scopes.map((scope, idx) => [
      `INV-${scope.id.substring(0, 8).toUpperCase()}-${idx + 1}`,
      scope.closed_date || new Date().toISOString().split('T')[0],
      scope.client_name,
      scope.cost_amount,
      scope.job_title,
      scope.cost_type === 'hourly' ? 'Labor' : 'Service'
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="quickbooks-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});