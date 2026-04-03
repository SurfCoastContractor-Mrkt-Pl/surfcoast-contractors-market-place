import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This function runs as a scheduled automation (service role context)
    // Fetch all Equipment records
    const equipment = await base44.asServiceRole.entities.Equipment.list('', 1000);
    
    let alertsCreated = 0;
    
    for (const item of equipment) {
      // Check if reorder_level is set and quantity falls below it
      if (item.data.reorder_level && item.data.quantity && item.data.quantity < item.data.reorder_level) {
        // Check if a notification already exists for this item (to avoid duplicates)
        const existing = await base44.asServiceRole.entities.LowStockNotification.filter({
          inventory_item_id: item.id,
          read: false
        });
        
        if (!existing || existing.length === 0) {
          // Create a new LowStockNotification
          await base44.asServiceRole.entities.LowStockNotification.create({
            contractor_id: item.data.contractor_id,
            contractor_email: item.data.contractor_email,
            inventory_item_id: item.id,
            material_name: item.data.name,
            current_quantity: item.data.quantity,
            low_stock_threshold: item.data.reorder_level,
            triggered_by: 'manual_adjustment'
          });
          
          alertsCreated++;
        }
      }
    }
    
    return Response.json({
      success: true,
      alertsCreated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in scheduledLowStockCheck:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});