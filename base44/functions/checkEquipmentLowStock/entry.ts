import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all equipment for the contractor
    const equipment = await base44.entities.Equipment.filter({ contractor_email: user.email });

    const lowStockItems = equipment.filter(item => 
      item.reorder_level && item.quantity <= item.reorder_level
    );

    // Send email alerts for low-stock items
    for (const item of lowStockItems) {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Low Stock Alert: ${item.name}`,
        body: `Your ${item.category} "${item.name}" is below the reorder level.\n\nCurrent Quantity: ${item.quantity}\nReorder Level: ${item.reorder_level}\n\nPlease consider reordering to avoid disruptions.${item.supplier ? `\n\nSupplier: ${item.supplier}\nContact: ${item.supplier_contact || 'N/A'}` : ''}`
      });
    }

    return Response.json({
      success: true,
      lowStockItemsCount: lowStockItems.length,
      itemsChecked: equipment.length
    });
  } catch (error) {
    console.error('Low stock check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});