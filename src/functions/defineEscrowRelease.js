/**
 * Define Escrow Release Trigger
 * Explicit workflow: Release on client review submission
 * Sets release_trigger_date and shows contractor expected payout date
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST required' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const { scope_id, trigger_type } = await req.json();

    // trigger_type: 'review_submitted' | 'manual_release' | 'contractor_request'
    // Default: review_submitted (automatic when client submits review)

    const scope = await base44.entities.ScopeOfWork.filter({ id: scope_id });
    if (!scope.length) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    const updated = await base44.entities.ScopeOfWork.update(scope_id, {
      escrow_release_trigger: trigger_type || 'review_submitted',
      escrow_release_date: new Date().toISOString(),
      escrow_expected_payout_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Next day
    });

    // Notify contractor of expected payout
    await base44.functions.invoke('sendEmailHelper', {
      to: updated.contractor_email,
      subject: 'Funds Released - Payout Expected Tomorrow',
      body: `Your $${updated.contractor_payout_amount} payout has been released and should arrive by ${new Date(updated.escrow_expected_payout_date).toLocaleDateString()}.`
    });

    console.log(`Escrow release triggered for scope ${scope_id}, trigger: ${trigger_type}`);

    return Response.json({ 
      scope: updated,
      message: 'Escrow release triggered',
      contractor_notified: true
    });
  } catch (error) {
    console.error('defineEscrowRelease error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});