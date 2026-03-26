import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shop_id, days = 90 } = await req.json();
    if (!shop_id) {
      return Response.json({ error: 'shop_id is required' }, { status: 400 });
    }

    // Verify user owns this shop (RLS-enforced)
    const shops = await base44.entities.MarketShop.filter({ 
      id: shop_id
    });

    if (!shops || shops.length === 0) {
      return Response.json({ error: 'Shop not found or unauthorized' }, { status: 403 });
    }

    // Get all orders for this shop within the specified time period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const orders = await base44.asServiceRole.entities.ConsumerOrder.filter({ 
      shop_id: shop_id
    });

    // Filter by date and calculate metrics
    const recentOrders = orders.filter(o => {
      const orderDate = new Date(o.placed_at || o.created_date);
      return orderDate >= cutoffDate && o.status === 'completed';
    });

    // Total sales
    const totalRevenue = recentOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = recentOrders.length;

    // Top listings
    const listingMap = {};
    recentOrders.forEach(order => {
      (order.items || []).forEach(item => {
        if (!listingMap[item.listing_id]) {
          listingMap[item.listing_id] = {
            listing_id: item.listing_id,
            product_name: item.product_name,
            quantity_sold: 0,
            revenue: 0,
            image_url: item.image_url,
          };
        }
        listingMap[item.listing_id].quantity_sold += item.quantity || 0;
        listingMap[item.listing_id].revenue += item.subtotal || 0;
      });
    });

    const topListings = Object.values(listingMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Customer reach (unique customers)
    const uniqueCustomers = new Set(recentOrders.map(o => o.consumer_email)).size;

    // Daily trend data for revenue and orders
    const trendMap = {};
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      trendMap[dateKey] = { date: dateKey, revenue: 0, orders: 0, customers: new Set() };
    }

    recentOrders.forEach(order => {
      const orderDate = new Date(order.placed_at || order.created_date).toISOString().split('T')[0];
      if (trendMap[orderDate]) {
        trendMap[orderDate].revenue += order.total || 0;
        trendMap[orderDate].orders += 1;
        trendMap[orderDate].customers.add(order.consumer_email);
      }
    });

    const trendData = Object.values(trendMap).map(d => ({
      date: d.date,
      revenue: parseFloat(d.revenue.toFixed(2)),
      orders: d.orders,
      customers: d.customers.size,
    }));

    return Response.json({
      shop_id,
      period_days: days,
      summary: {
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
        total_orders: totalOrders,
        unique_customers: uniqueCustomers,
        avg_order_value: totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0,
      },
      top_listings: topListings,
      trend_data: trendData,
    });
  } catch (error) {
    console.error('getVendorAnalytics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});