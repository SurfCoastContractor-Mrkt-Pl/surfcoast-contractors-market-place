/**
 * Send Payout Confirmation
 * Sends contractor detailed payout info after escrow release
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { scope_id, stripe_payout_id } = await req.json();

    const scopes = await base44.entities.ScopeOfWork.filter({ id: scope_id });
    if (!scopes.length) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    const scope = scopes[0];
    const platformFee = scope.cost_amount * 0.18;
    const payoutAmount = scope.cost_amount - platformFee;

    const emailBody = `
    <h2>Payment Released ✓</h2>
    <p>Hi ${scope.contractor_name},</p>
    <p>Your job with ${scope.client_name} is complete and payment has been released from escrow.</p>
    
    <h3>Payout Details</h3>
    <table style="border-collapse: collapse; width: 100%; max-width: 400px;">
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px;">Job Cost:</td>
        <td style="padding: 8px; text-align: right;">$${scope.cost_amount.toFixed(2)}</td>
      </tr>
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px;">Platform Fee (18%):</td>
        <td style="padding: 8px; text-align: right;">-$${platformFee.toFixed(2)}</td>
      </tr>
      <tr style="background-color: #f5f5f5;">
        <td style="padding: 8px; font-weight: bold;">Your Payout:</td>
        <td style="padding: 8px; text-align: right; font-weight: bold;">$${payoutAmount.toFixed(2)}</td>
      </tr>
    </table>
    
    <p><strong>Status:</strong> Transferred to Stripe account</p>
    <p><strong>Expected Arrival:</strong> 1-2 business days</p>
    <p><strong>Transaction ID:</strong> ${stripe_payout_id || 'pending'}</p>
    
    <p>Questions? Contact support@example.com</p>
    `;

    await base44.integrations.Core.SendEmail({
      to: scope.contractor_email,
      subject: `Payment Released - $${payoutAmount.toFixed(2)} Payout Confirmed`,
      body: emailBody
    });

    console.log(`Payout confirmation sent to ${scope.contractor_email}, amount: $${payoutAmount}`);

    return Response.json({ 
      success: true,
      contractor_email: scope.contractor_email,
      payout_amount: payoutAmount,
      message: 'Payout confirmation email sent'
    });
  } catch (error) {
    console.error('sendPayoutConfirmation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});