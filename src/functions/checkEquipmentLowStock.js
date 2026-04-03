import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch all Equipment records
    const equipment = await base44.asServiceRole.entities.Equipment.list('', 1000);
    
    let lowStockItemsCount = 0;
    const itemsChecked = equipment.length;
    
    for (const item of equipment) {
      // Check if reorder_level is set and quantity falls below it
      if (item.data.reorder_level && item.data.quantity && item.data.quantity < item.data.reorder_level) {
        // Create a LowStockNotification
        await base44.asServiceRole.entities.LowStockNotification.create({
          contractor_id: item.data.contractor_id,
          contractor_email: item.data.contractor_email,
          inventory_item_id: item.id,
          material_name: item.data.name,
          current_quantity: item.data.quantity,
          low_stock_threshold: item.data.reorder_level,
          triggered_by: 'manual_adjustment'
        });
        
        lowStockItemsCount++;
      }
    }
    
    return Response.json({
      success: true,
      lowStockItemsCount,
      itemsChecked
    });
  } catch (error) {
    console.error('Error in checkEquipmentLowStock:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});