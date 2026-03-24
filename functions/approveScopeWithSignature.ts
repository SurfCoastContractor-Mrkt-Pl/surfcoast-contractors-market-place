import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { scope_id, signature_url, customer_email, customer_name, contractor_name } = body;

    // Validate required fields
    if (!scope_id || !signature_url || !customer_email) {
      return Response.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Verify user authentication
    const user = await base44.auth.me();
    if (!user || user.email !== customer_email) {
      return Response.json({ 
        error: 'Unauthorized: Only the customer can approve this scope' 
      }, { status: 403 });
    }

    // Fetch the scope record
    const scope = await base44.entities.ScopeOfWork.filter({ 
      id: scope_id 
    });

    if (!scope || scope.length === 0) {
      return Response.json({ 
        error: 'Scope of Work not found' 
      }, { status: 404 });
    }

    const scopeRecord = scope[0];

    // Verify customer email matches
    if (scopeRecord.customer_email !== customer_email) {
      return Response.json({ 
        error: 'Unauthorized: This scope does not belong to you' 
      }, { status: 403 });
    }

    // Update scope status to approved and store signature in dedicated field
    await base44.entities.ScopeOfWork.update(scope_id, {
      status: 'approved',
      customer_signature_url: signature_url,
      customer_signed_scope_at: new Date().toISOString(),
    });

    // Send approval email to contractor
    await base44.integrations.Core.SendEmail({
      to: scopeRecord.contractor_email,
      subject: `Scope & Estimate Approved - ${scopeRecord.job_title}`,
      body: `
Hello ${contractor_name},

Great news! ${customer_name} has approved the Scope of Work and Estimate for ${scopeRecord.job_title}.

Estimate Details:
${scopeRecord.cost_type === 'hourly' 
  ? `Hourly Rate: $${scopeRecord.cost_amount}/hr (Est. ${scopeRecord.estimated_hours} hours)`
  : `Fixed Price: $${scopeRecord.cost_amount}`}

Agreed Work Date: ${scopeRecord.agreed_work_date || 'To be confirmed'}

The customer has digitally signed the agreement. You can now proceed with scheduling and completing the work.

Best regards,
SurfCoast Marketplace
      `,
    });

    // Send confirmation email to customer
    await base44.integrations.Core.SendEmail({
      to: customer_email,
      subject: `Scope & Estimate Approved - ${scopeRecord.job_title}`,
      body: `
Hello ${customer_name},

Your approval has been recorded! Your digital signature confirms your agreement with the following terms:

Project: ${scopeRecord.job_title}
Contractor: ${contractor_name}
Scope: ${scopeRecord.scope_summary}

Estimate:
${scopeRecord.cost_type === 'hourly' 
  ? `$${scopeRecord.cost_amount}/hr (Est. ${scopeRecord.estimated_hours} hours)`
  : `$${scopeRecord.cost_amount}`}

Agreed Work Date: ${scopeRecord.agreed_work_date || 'To be confirmed'}

The contractor will be in touch shortly to finalize details and schedule the work.

Best regards,
SurfCoast Marketplace
      `,
    });

    return Response.json({ 
      success: true,
      message: 'Scope approved and signatures recorded' 
    });

  } catch (error) {
    console.error('Error approving scope with signature:', error);
    return Response.json({ 
      error: 'Failed to approve scope',
      details: error.message 
    }, { status: 500 });
  }
});