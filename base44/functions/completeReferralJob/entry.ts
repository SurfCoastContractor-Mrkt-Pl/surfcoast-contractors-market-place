import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * DEPRECATED — use completeReferral instead.
 * This endpoint now redirects all calls to completeReferral logic for backward compatibility.
 */
Deno.serve(async (req) => {
  return Response.json({
    error: 'This endpoint is deprecated. Use completeReferral instead.',
    info: 'Referral rewards are now triggered by profile completion, not job completion.'
  }, { status: 410 });
});