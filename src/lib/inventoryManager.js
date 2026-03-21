import { base44 } from '@/api/base44Client';

/**
 * Updates inventory after successful checkout
 * Decreases quantity_available and marks items as sold_out when inventory reaches zero
 */
export async function updateInventoryAfterSale(cartItems, orderId = null) {
  try {
    if (!cartItems || cartItems.length === 0) {
      console.warn('No items to update inventory for');
      return { success: false, error: 'Empty cart' };
    }

    // Format cart items for the backend function
    const itemsToUpdate = cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity || 1
    }));

    console.log(`[Frontend] Updating inventory for ${itemsToUpdate.length} items`);

    // Call the backend function
    const response = await base44.functions.invoke('updateInventoryOnSale', {
      cartItems: itemsToUpdate,
      orderId: orderId
    });

    // Handle response
    if (response.data?.success) {
      console.log('✓ Inventory updated successfully:', response.data.summary);
      return {
        success: true,
        updated: response.data.updated,
        summary: response.data.summary
      };
    } else if (response.data?.updated?.length > 0) {
      // Partial success
      console.warn('⚠ Partial inventory update:', response.data.summary);
      return {
        success: true,
        partial: true,
        updated: response.data.updated,
        errors: response.data.errors,
        summary: response.data.summary
      };
    } else {
      console.error('✗ Inventory update failed:', response.data?.error);
      return {
        success: false,
        error: response.data?.error || 'Unknown error'
      };
    }
  } catch (error) {
    console.error('✗ Inventory update error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update inventory'
    };
  }
}

/**
 * Validates that all cart items have available inventory
 */
export async function validateInventoryAvailability(cartItems) {
  try {
    const listingIds = [...new Set(cartItems.map(item => item.id))];
    
    // Fetch current listings
    const listings = await base44.entities.MarketListing.filter({
      id: { $in: listingIds }
    });

    const validation = {
      valid: true,
      unavailableItems: [],
      insufficientItems: []
    };

    for (const item of cartItems) {
      const listing = listings.find(l => l.id === item.id);

      if (!listing || listing.status === 'sold_out') {
        validation.unavailableItems.push({
          id: item.id,
          name: listing?.product_name || 'Unknown',
          reason: 'Out of stock'
        });
        validation.valid = false;
      } else if (listing.quantity_available < item.quantity) {
        validation.insufficientItems.push({
          id: item.id,
          name: listing.product_name,
          available: listing.quantity_available,
          requested: item.quantity
        });
        validation.valid = false;
      }
    }

    return validation;
  } catch (error) {
    console.error('Inventory validation error:', error);
    return {
      valid: false,
      error: error.message
    };
  }
}