import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the shop owned by this user
    const shops = await base44.entities.MarketShop.filter({
      email: user.email,
    });

    if (!shops || shops.length === 0) {
      return Response.json({ error: 'No shop found' }, { status: 404 });
    }

    const shop = shops[0];

    // Fetch all orders for this shop
    const orders = await base44.entities.ConsumerOrder.filter({
      shop_id: shop.id,
    });

    // Fetch all reviews for this shop
    const reviews = await base44.entities.VendorReview.filter({
      shop_id: shop.id,
    });

    // Aggregate data by month
    const monthlyData = {};
    const monthlyRatings = {};

    if (orders && orders.length > 0) {
      orders.forEach((order) => {
        const date = new Date(order.placed_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            orders: 0,
            revenue: 0,
            vendorPayout: 0,
          };
        }

        monthlyData[monthKey].orders += 1;
        monthlyData[monthKey].revenue += order.total;
        monthlyData[monthKey].vendorPayout += order.vendor_payout || (order.total * 0.95); // Assume 95% to vendor
      });
    }

    if (reviews && reviews.length > 0) {
      reviews.forEach((review) => {
        const date = new Date(review.created_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyRatings[monthKey]) {
          monthlyRatings[monthKey] = {
            ratings: [],
          };
        }

        monthlyRatings[monthKey].ratings.push(review.rating);
      });
    }

    // Calculate monthly averages
    const chartData = Object.keys(monthlyData)
      .sort()
      .map((monthKey) => {
        const ratingData = monthlyRatings[monthKey];
        const avgRating =
          ratingData && ratingData.ratings.length > 0
            ? (ratingData.ratings.reduce((a, b) => a + b, 0) / ratingData.ratings.length).toFixed(2)
            : null;

        return {
          ...monthlyData[monthKey],
          averageRating: avgRating ? parseFloat(avgRating) : null,
        };
      });

    // Calculate totals
    const totalRevenue = orders ? orders.reduce((sum, o) => sum + o.total, 0) : 0;
    const totalVendorPayout = orders
      ? orders.reduce((sum, o) => sum + (o.vendor_payout || o.total * 0.95), 0)
      : 0;
    const totalOrders = orders ? orders.length : 0;
    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;
    const averageRating =
      reviews && reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
        : 0;

    return Response.json({
      shop: {
        id: shop.id,
        name: shop.shop_name,
        type: shop.shop_type,
      },
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalVendorPayout: parseFloat(totalVendorPayout.toFixed(2)),
        totalOrders,
        averageOrderValue: parseFloat(averageOrderValue),
        averageRating: parseFloat(averageRating),
        totalReviews: reviews ? reviews.length : 0,
      },
      chartData,
      recentOrders: orders
        ? orders
            .sort((a, b) => new Date(b.placed_at) - new Date(a.placed_at))
            .slice(0, 10)
            .map((o) => ({
              id: o.id,
              orderNumber: o.order_number,
              total: o.total,
              placedAt: o.placed_at,
              status: o.status,
            }))
        : [],
    });
  } catch (error) {
    console.error('Error fetching analytics:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});