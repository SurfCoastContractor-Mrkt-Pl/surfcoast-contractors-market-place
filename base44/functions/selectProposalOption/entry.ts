import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { proposal_id, option_id } = payload;

    // Get proposal
    const proposals = await base44.entities.Proposal.filter({
      id: proposal_id
    });

    if (!proposals.length) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const proposal = proposals[0];

    // Verify user is the customer
    if (proposal.data.customer_email !== user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get the selected option
    const options = await base44.entities.ProposalOption.filter({
      id: option_id
    });

    if (!options.length) {
      return Response.json({ error: 'Option not found' }, { status: 404 });
    }

    const option = options[0];

    // Verify option belongs to this proposal
    if (option.data.proposal_id !== proposal_id) {
      return Response.json({ error: 'Option does not belong to this proposal' }, { status: 400 });
    }

    // Create a ScopeOfWork from the selected option
    const scopeOfWork = await base44.entities.ScopeOfWork.create({
      contractor_name: proposal.data.contractor_name,
      customer_name: proposal.data.customer_name,
      customer_email: proposal.data.customer_email,
      job_title: proposal.data.job_title,
      contractor_email: proposal.data.contractor_email,
      cost_type: option.data.cost_type,
      cost_amount: option.data.cost_amount,
      estimated_hours: option.data.estimated_hours || null,
      scope_summary: option.data.scope_summary || option.data.description,
      status: 'pending_approval'
    });

    // Update the proposal with the selection
    await base44.entities.Proposal.update(proposal_id, {
      selected_option_id: option_id,
      selected_scope_id: scopeOfWork.id,
      status: 'option_selected',
      selected_date: new Date().toISOString()
    });

    return Response.json({
      success: true,
      scope_id: scopeOfWork.id,
      message: 'Option selected and scope of work created'
    });
  } catch (error) {
    console.error('selectProposalOption error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});