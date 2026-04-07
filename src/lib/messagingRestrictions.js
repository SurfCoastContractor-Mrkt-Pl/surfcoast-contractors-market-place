/**
 * Messaging Restrictions for WAVE OS Tiers
 * 
 * Premium: FREE with past clients only (no add-on)
 * Residential Bundle: FREE with ALL clients (existing + new)
 * Others: $1.50 per 10-min or $50/mo subscription
 */

export async function checkMessagingAccess(contractorEmail, clientEmail, subscriptionTier) {
  // Residential Bundle: unlimited access
  if (subscriptionTier === 'premium_residential') {
    return { allowed: true, reason: 'Residential Bundle includes unlimited messaging' };
  }

  // Premium: only with past clients
  if (subscriptionTier === 'premium') {
    const isPastClient = await isPastClientOfContractor(contractorEmail, clientEmail);
    return {
      allowed: isPastClient,
      reason: isPastClient
        ? 'Past client eligible for free messaging'
        : 'Premium messaging restricted to past clients. Upgrade to Residential Bundle for all clients, or pay-per-session.'
    };
  }

  // All other tiers: paid access required
  return {
    allowed: false,
    reason: 'Direct messaging requires payment ($1.50/session or $50/mo subscription)'
  };
}

/**
 * Check if client has completed work with contractor
 */
async function isPastClientOfContractor(contractorEmail, clientEmail) {
  try {
    const { base44 } = await import('@/api/base44Client.js');
    
    // Query for completed scopes between contractor and client
    const completedScopes = await base44.entities.ScopeOfWork.filter({
      contractor_email: contractorEmail,
      client_email: clientEmail,
      status: 'closed'
    });

    return completedScopes && completedScopes.length > 0;
  } catch (error) {
    console.error('Error checking past client status:', error);
    return false;
  }
}

export { isPastClientOfContractor };