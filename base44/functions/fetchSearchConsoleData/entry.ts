import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { days = 90, row_limit = 100 } = await req.json();

    // Get Google Search Console connection
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_search_console');

    if (!accessToken) {
      return Response.json({ error: 'Google Search Console not connected' }, { status: 401 });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    // Get list of properties first
    const propertiesResponse = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!propertiesResponse.ok) {
      console.error('Failed to fetch properties:', await propertiesResponse.text());
      return Response.json({ error: 'Failed to fetch properties' }, { status: 500 });
    }

    const propertiesData = await propertiesResponse.json();
    const siteUrl = propertiesData.siteEntry?.[0]?.siteUrl;

    if (!siteUrl) {
      return Response.json({ error: 'No Search Console properties found' }, { status: 404 });
    }

    // Fetch search query data
    const searchDataResponse = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: start,
          endDate: end,
          dimensions: ['query'],
          rowLimit: row_limit,
          orderBy: [
            { fieldName: 'impressions', sortOrder: 'DESCENDING' },
            { fieldName: 'clicks', sortOrder: 'DESCENDING' },
          ],
        }),
      }
    );

    if (!searchDataResponse.ok) {
      const error = await searchDataResponse.text();
      console.error('Search Analytics API error:', error);
      return Response.json({ error: 'Failed to fetch search data' }, { status: 500 });
    }

    const searchData = await searchDataResponse.json();

    // Transform data
    const queries = (searchData.rows || []).map((row) => ({
      query: row.keys[0],
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: (row.ctr * 100).toFixed(2),
      position: parseFloat(row.position.toFixed(2)),
    }));

    // Get page performance
    const pageDataResponse = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query?key=${Deno.env.get('STRIPE_SECRET_KEY')}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: start,
          endDate: end,
          dimensions: ['page'],
          rowLimit: 50,
          orderBy: [
            { fieldName: 'impressions', sortOrder: 'DESCENDING' },
          ],
        }),
      }
    );

    let pageData = [];
    if (pageDataResponse.ok) {
      const pages = await pageDataResponse.json();
      pageData = (pages.rows || []).map((row) => ({
        page: row.keys[0],
        impressions: row.impressions,
        clicks: row.clicks,
        ctr: (row.ctr * 100).toFixed(2),
        position: parseFloat(row.position.toFixed(2)),
      }));
    }

    return Response.json({
      success: true,
      siteUrl,
      dateRange: { start, end, days },
      queries,
      pages: pageData,
      summary: {
        totalImpressions: queries.reduce((sum, q) => sum + q.impressions, 0),
        totalClicks: queries.reduce((sum, q) => sum + q.clicks, 0),
        avgCtr: (queries.reduce((sum, q) => sum + parseFloat(q.ctr), 0) / queries.length).toFixed(2),
        avgPosition: (queries.reduce((sum, q) => sum + q.position, 0) / queries.length).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Error fetching Search Console data:', error);
    return Response.json({ error: error.message || 'Failed to fetch data' }, { status: 500 });
  }
});