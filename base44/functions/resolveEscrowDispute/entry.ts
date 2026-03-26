/**
 * REMOVED — Per SurfCoast Terms & Conditions, the platform does NOT mediate,
 * arbitrate, or resolve disputes between customers and contractors.
 *
 * Dispute handling is fully automated:
 * - Customer disputes via releaseEscrow (action="dispute")
 * - Stripe PaymentIntent is immediately cancelled
 * - Customer is automatically refunded
 * - Both parties are notified to resolve directly between themselves
 *
 * This file is intentionally left as a no-op to prevent accidental invocation.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  return Response.json({
    error: 'This function is disabled. Per platform Terms & Conditions, SurfCoast does not arbitrate disputes. Disputes are resolved automatically — the customer is refunded and parties resolve directly.'
  }, { status: 410 });
});