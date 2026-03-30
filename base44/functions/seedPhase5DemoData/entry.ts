import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403 }
      );
    }

    // Create demo scope
    const scope = await base44.entities.ScopeOfWork.create({
      contractor_name: 'Demo Contractor',
      client_name: 'Demo Client',
      client_email: 'demo@example.com',
      contractor_email: 'contractor@example.com',
      job_title: 'Kitchen Renovation Project',
      scope_summary: 'Complete kitchen remodel with new cabinets, countertops, and appliances',
      cost_type: 'fixed',
      cost_amount: 5000,
      status: 'approved',
      client_signed_scope_at: new Date().toISOString(),
    });

    // Create demo milestones
    const milestones = [
      { milestone_name: 'Site Prep & Demo', status: 'completed', completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), order_index: 1 },
      { milestone_name: 'Electrical Work', status: 'completed', completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), order_index: 2 },
      { milestone_name: 'Cabinet Installation', status: 'pending', due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), order_index: 3 },
      { milestone_name: 'Final Inspection', status: 'pending', due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), order_index: 4 },
    ];

    for (const milestone of milestones) {
      await base44.entities.ProjectMilestone.create({
        scope_id: scope.id,
        contractor_email: 'contractor@example.com',
        ...milestone,
      });
    }

    // Create demo expenses
    const expenses = [
      { description: 'Materials - Cabinets', amount: 1500, category: 'Materials', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
      { description: 'Labor - Day 1', amount: 400, category: 'Labor', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { description: 'Countertop Material', amount: 800, category: 'Materials', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
      { description: 'Electrical Materials', amount: 250, category: 'Materials', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { description: 'Labor - Day 2', amount: 400, category: 'Labor', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { description: 'Equipment Rental', amount: 200, category: 'Equipment', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    ];

    for (const expense of expenses) {
      await base44.entities.JobExpense?.create({
        scope_id: scope.id,
        ...expense,
        created_at: expense.date,
      }).catch(() => null);
    }

    // Create demo messages
    const messages = [
      { sender_email: 'contractor@example.com', sender_name: 'John Contractor', sender_type: 'contractor', recipient_email: 'demo@example.com', recipient_name: 'Demo Client', message: 'Great progress on the demo phase! Should be wrapped up tomorrow.' },
      { sender_email: 'demo@example.com', sender_name: 'Demo Client', sender_type: 'client', recipient_email: 'contractor@example.com', recipient_name: 'John Contractor', message: 'Thanks! Looking forward to seeing the electrical work start.' },
    ];

    for (const msg of messages) {
      await base44.entities.ProjectMessage.create({
        scope_id: scope.id,
        ...msg,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Phase 5 demo data created',
        scope_id: scope.id,
        scope_title: 'Kitchen Renovation Project',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Demo data seeding error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});