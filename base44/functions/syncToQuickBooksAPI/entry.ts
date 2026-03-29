import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { qb_customer_id, qb_realm_id, qb_access_token } = await req.json();

    if (!qb_access_token) {
      return Response.json({ error: 'QB auth required' }, { status: 400 });
    }

    // Fetch closed scopes for this contractor
    const closedScopes = await base44.entities.ScopeOfWork.filter({
      contractor_email: user.email,
      status: 'closed'
    });

    if (!closedScopes?.length) {
      return Response.json({
        success: true,
        synced_count: 0,
        message: 'No closed jobs to sync'
      });
    }

    // Transform to QB invoice format
    const invoices = closedScopes.map(scope => ({
      DocNumber: scope.id.substring(0, 10),
      TxnDate: scope.closed_date || new Date().toISOString().split('T')[0],
      CustomerRef: { value: qb_customer_id },
      Line: [{
        DetailType: 'SalesItemLineDetail',
        Description: scope.job_title,
        Amount: scope.contractor_payout_amount,
        SalesItemLineDetail: {
          ItemRef: { value: '1' },
          Qty: 1,
          UnitPrice: scope.contractor_payout_amount
        }
      }]
    }));

    // Log sync attempt (actual QB API call would happen here with real credentials)
    console.log(`QB Sync: ${invoices.length} invoices prepared for realm ${qb_realm_id}`);

    return Response.json({
      success: true,
      synced_count: invoices.length,
      invoices: invoices,
      message: 'Ready to post invoices to QuickBooks. Use QB REST API v2 endpoint: /v2/company/{realmId}/invoice'
    });
  } catch (error) {
    console.error('QB Sync Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});