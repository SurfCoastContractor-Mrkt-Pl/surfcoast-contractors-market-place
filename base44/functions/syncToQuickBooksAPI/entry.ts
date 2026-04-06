import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Scheduled automation path: reconciliation report using internal data only
    const isScheduled = !body.qb_customer_id && !body.qb_realm_id;

    if (isScheduled) {
      // Run a daily reconciliation check: identify closed scopes that haven't been exported to QB
      const closedScopes = await base44.asServiceRole.entities.ScopeOfWork.filter(
        { status: 'closed' }, '-closed_date', 5000
      );

      const notExported = closedScopes.filter(s => !s.qb_synced_at && s.contractor_payout_amount > 0);
      const exported = closedScopes.filter(s => !!s.qb_synced_at);

      console.log(`[QB Reconciliation] Total closed: ${closedScopes.length}, Exported: ${exported.length}, Pending export: ${notExported.length}`);

      return Response.json({
        success: true,
        report: 'daily_reconciliation',
        total_closed_scopes: closedScopes.length,
        exported_to_qb: exported.length,
        pending_export: notExported.length,
        pending_scope_ids: notExported.map(s => s.id),
        checked_at: new Date().toISOString()
      });
    }

    // Manual / contractor-initiated sync path (requires auth + QB credentials)
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { qb_customer_id, qb_realm_id } = body;

    const qb_access_token = Deno.env.get('QUICKBOOKS_ACCESS_TOKEN');
    if (!qb_access_token) {
      return Response.json({ error: 'QB auth not configured' }, { status: 500 });
    }

    const closedScopes = await base44.entities.ScopeOfWork.filter({
      contractor_email: user.email,
      status: 'closed'
    });

    if (!closedScopes?.length) {
      return Response.json({ success: true, synced_count: 0, message: 'No closed jobs to sync' });
    }

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