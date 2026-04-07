import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only allow admin to trigger cleanup
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Demo contractor emails to delete
    const demo_contractors = [
      'alex.contractor@example.com',
      'maria.contractor@example.com',
      'james.contractor@example.com'
    ];

    // Demo customer emails to delete
    const demo_customers = [
      'client.one@example.com',
      'client.two@example.com',
      'client.three@example.com'
    ];

    let deleted = {
      contractors: 0,
      customers: 0,
      reviews: 0,
      payments: 0
    };

    // Delete contractors
    for (const email of demo_contractors) {
      try {
        const contractors = await base44.asServiceRole.entities.Contractor.filter({ email });
        for (const contractor of contractors) {
          await base44.asServiceRole.entities.Contractor.delete(contractor.id);
          deleted.contractors++;
        }
      } catch (err) {
        console.error(`Failed to delete contractor ${email}:`, err.message);
      }
    }

    // Delete customer profiles
    for (const email of demo_customers) {
      try {
        const customers = await base44.asServiceRole.entities.CustomerProfile.filter({ email });
        for (const customer of customers) {
          await base44.asServiceRole.entities.CustomerProfile.delete(customer.id);
          deleted.customers++;
        }
      } catch (err) {
        console.error(`Failed to delete customer ${email}:`, err.message);
      }
    }

    // Delete demo reviews (those from demo customers)
    try {
      for (const email of demo_customers) {
        const reviews = await base44.asServiceRole.entities.Review.filter({ reviewer_email: email });
        for (const review of reviews) {
          await base44.asServiceRole.entities.Review.delete(review.id);
          deleted.reviews++;
        }
      }
    } catch (err) {
      console.error('Failed to delete reviews:', err.message);
    }

    // Delete demo payments
    try {
      for (const email of demo_customers) {
        const payments = await base44.asServiceRole.entities.Payment.filter({ payer_email: email });
        for (const payment of payments) {
          await base44.asServiceRole.entities.Payment.delete(payment.id);
          deleted.payments++;
        }
      }
    } catch (err) {
      console.error('Failed to delete payments:', err.message);
    }

    return Response.json({
      success: true,
      message: 'Demo data cleanup complete',
      deleted_summary: deleted,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error('Cleanup error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});