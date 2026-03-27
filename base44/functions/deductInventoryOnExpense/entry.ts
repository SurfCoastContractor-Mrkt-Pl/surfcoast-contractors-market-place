import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data } = payload;

    // Only process JobExpense create events
    if (event.type !== 'create' || event.entity_name !== 'JobExpense') {
      return Response.json({ success: true, skipped: true });
    }

    const expense = data;

    // Only process material expenses
    if (expense.expense_type !== 'materials') {
      return Response.json({ success: true, skipped: true, reason: 'not_materials' });
    }

    // Find inventory items by contractor
    const inventoryItems = await base44.asServiceRole.entities.ContractorInventory.filter({
      contractor_id: expense.contractor_id,
    });

    if (!inventoryItems || inventoryItems.length === 0) {
      return Response.json({ success: true, skipped: true, reason: 'no_inventory' });
    }

    // Try to find a matching material by description (fuzzy match)
    const matchedItem = findMatchingInventoryItem(inventoryItems, expense.description);

    if (!matchedItem) {
      return Response.json({ success: true, skipped: true, reason: 'no_matching_item' });
    }

    // Calculate new quantity (deduct 1 unit as a default; could be made configurable)
    const newQuantity = matchedItem.current_quantity - 1;

    // Update inventory
    await base44.asServiceRole.entities.ContractorInventory.update(matchedItem.id, {
      current_quantity: newQuantity,
    });

    // Check if low stock threshold breached
    if (newQuantity <= matchedItem.low_stock_threshold && newQuantity > matchedItem.low_stock_threshold - 1) {
      // Threshold just crossed, create notification
      await base44.asServiceRole.entities.LowStockNotification.create({
        contractor_id: expense.contractor_id,
        contractor_email: expense.contractor_email,
        inventory_item_id: matchedItem.id,
        material_name: matchedItem.material_name,
        current_quantity: newQuantity,
        low_stock_threshold: matchedItem.low_stock_threshold,
        triggered_by: 'expense_deduction',
        expense_id: expense.id,
      });
    }

    return Response.json({
      success: true,
      deducted: true,
      inventoryItem: matchedItem.id,
      newQuantity,
      lowStockAlert: newQuantity <= matchedItem.low_stock_threshold,
    });
  } catch (error) {
    console.error('Error deducting inventory:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Helper: Fuzzy match inventory item to expense description
function findMatchingInventoryItem(items, expenseDescription) {
  const desc = expenseDescription.toLowerCase();

  // Exact or high-confidence match
  for (const item of items) {
    const itemName = item.material_name.toLowerCase();
    if (desc.includes(itemName) || itemName.includes(desc)) {
      return item;
    }
  }

  // No match found
  return null;
}