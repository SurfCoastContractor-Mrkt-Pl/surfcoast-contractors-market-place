import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Basic health check endpoint
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Require admin role or internal service key
    const serviceKey = req.headers.get('x-internal-service-key');
    const validServiceKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    const isServiceKeyValid = serviceKey && validServiceKey && serviceKey === validServiceKey;

    if (!isServiceKeyValid) {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Perform basic health checks
    const checks = {
      api: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime ? process.uptime() : null
    };

    // Try to access database
    try {
      await base44.asServiceRole.entities.HealthCheck.list('', 1);
      checks.database = true;
    } catch (err) {
      checks.database = false;
      console.error('Database check failed:', err);
    }

    const allHealthy = Object.entries(checks)
      .filter(([k]) => k !== 'timestamp' && k !== 'uptime')
      .every(([, v]) => v === true);

    return Response.json({
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      responseTime: Date.now()
    });
  } catch (error) {
    console.error('healthCheck error:', error);
    return Response.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 500 });
  }
});