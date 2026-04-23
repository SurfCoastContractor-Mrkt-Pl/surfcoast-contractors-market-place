import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled automation — runs nightly at 2 AM without user context.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Scheduled automation — must be triggered by platform or internal service key
    const serviceKey = req.headers.get('x-internal-key');
    const isAutomation = req.headers.get('x-automation-id'); // set by platform automations
    if (!isAutomation && (!serviceKey || serviceKey !== Deno.env.get('INTERNAL_SERVICE_KEY'))) {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Fetch all Equipment records using service role (no user auth needed)
    const equipment = await base44.asServiceRole.entities.Equipment.list('', 1000);

    if (!equipment || equipment.length === 0) {
      return Response.json({ success: true, alertsCreated: 0, message: 'No equipment found' });
    }

    let alertsCreated = 0;

    for (const item of equipment) {
      // Only check items with a reorder_level set and quantity below it
      if (item.reorder_level && item.quantity != null && item.quantity < item.reorder_level) {
        // Avoid duplicate notifications — skip if one already exists (unread)
        const existing = await base44.asServiceRole.entities.LowStockNotification.filter({
          inventory_item_id: item.id,
          read: false
        });

        if (!existing || existing.length === 0) {
          await base44.asServiceRole.entities.LowStockNotification.create({
            contractor_id: item.contractor_id,
            contractor_email: item.contractor_email,
            inventory_item_id: item.id,
            material_name: item.name,
            current_quantity: item.quantity,
            low_stock_threshold: item.reorder_level,
            triggered_by: 'scheduled_check'
          });

          alertsCreated++;
          console.log(`[LOW_STOCK] Alert created for ${item.name} (qty: ${item.quantity}, threshold: ${item.reorder_level})`);
        }
      }
    }

    console.log(`[LOW_STOCK] Check complete. Checked: ${equipment.length}, Alerts created: ${alertsCreated}`);

    return Response.json({
      success: true,
      checked: equipment.length,
      alertsCreated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[LOW_STOCK_ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});