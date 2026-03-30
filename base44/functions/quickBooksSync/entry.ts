import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { contractor_email, qb_customer_id, qb_account_token } = body;

    // Only allow the authenticated user to sync their own data
    if (user.email !== contractor_email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!contractor_email || !qb_customer_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch all closed scopes (invoices) for contractor
    const scopes = await base44.entities.ScopeOfWork.filter({
      contractor_email,
      status: 'closed'
    });

    // Prepare QB invoice data
    const invoices = scopes.map(scope => ({
      CustomerRef: { value: qb_customer_id },
      Line: [{
        Amount: scope.contractor_payout_amount,
        DetailType: 'SalesItemLineDetail',
        Description: scope.job_title,
        SalesItemLineDetail: {
          ItemRef: { value: '1' } // Generic service item
        }
      }],
      DueDate: new Date(scope.closed_date).toISOString().split('T')[0],
      DocNumber: `INV-${scope.id.substring(0, 8).toUpperCase()}`
    }));

    return Response.json({
      success: true,
      invoicesCount: invoices.length,
      invoices: invoices.slice(0, 5), // Return first 5 as preview
      message: `Ready to sync ${invoices.length} invoices to QuickBooks. Use QB API to post these invoices.`
    });
  } catch (error) {
    console.error('QB sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});