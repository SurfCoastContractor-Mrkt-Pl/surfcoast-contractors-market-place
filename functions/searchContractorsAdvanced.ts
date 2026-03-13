import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      query, 
      trades = [], 
      minRating = 0, 
      location, 
      maxDistance = 50,
      maxPrice,
      minPrice 
    } = await req.json();

    // Build filter - only show publicly available contractors
    const filter = {
      $and: [
        { account_locked: false },
        { minor_hours_locked: false }
      ]
    };

    if (trades.length > 0) {
      filter.$and.push({ trade_specialty: { $in: trades } });
    }

    if (minRating > 0) {
      filter.$and.push({ rating: { $gte: minRating } });
    }

    // Fetch contractors respecting RLS (public visibility only)
    let contractors = await base44.entities.Contractor.filter(filter);

    // Apply text search
    if (query) {
      contractors = contractors.filter(c =>
        c.name?.toLowerCase().includes(query.toLowerCase()) ||
        c.bio?.toLowerCase().includes(query.toLowerCase()) ||
        c.skills?.some(s => s.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Apply location filter if provided
    if (location) {
      contractors = contractors.filter(c => 
        c.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Apply price range
    if (minPrice !== undefined) {
      contractors = contractors.filter(c => c.hourly_rate >= minPrice);
    }
    if (maxPrice !== undefined) {
      contractors = contractors.filter(c => c.hourly_rate <= maxPrice);
    }

    // Sort by rating and featured status
    contractors.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });

    return Response.json({
      success: true,
      results: contractors,
      count: contractors.length,
    });
  } catch (error) {
    console.error('Search error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});