import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { proposal_id, title, description, cost_type, cost_amount, estimated_hours, estimated_duration, includes, excludes, notes, scope_summary } = payload;

    // Verify contractor owns the proposal
    const proposals = await base44.entities.Proposal.filter({
      id: proposal_id
    });

    if (!proposals.length) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const proposal = proposals[0];
    if (proposal.data.contractor_email !== user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get current option count to determine option_number
    const existingOptions = await base44.entities.ProposalOption.filter({
      proposal_id: proposal_id
    });

    const option_number = existingOptions.length + 1;

    // Create proposal option
    const option = await base44.entities.ProposalOption.create({
      proposal_id: proposal_id,
      contractor_email: user.email,
      option_number: option_number,
      title: title,
      description: description,
      cost_type: cost_type,
      cost_amount: cost_amount,
      estimated_hours: estimated_hours || null,
      estimated_duration: estimated_duration || '',
      includes: includes || [],
      excludes: excludes || [],
      notes: notes || '',
      scope_summary: scope_summary || ''
    });

    return Response.json({ option_id: option.id, option_number: option_number });
  } catch (error) {
    console.error('addProposalOption error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});