import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      brandName,
      domain,
      logoUrl,
      primaryColor,
      secondaryColor,
      supportEmail,
      featureFlags,
      paymentSettings,
    } = await req.json();

    if (!brandName || !domain) {
      return Response.json({ error: 'Brand name and domain required' }, { status: 400 });
    }

    // Validate domain format
    const domainRegex = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(domain)) {
      return Response.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    // Create brand
    const brand = await base44.entities.WhiteLabelBrand.create({
      owner_email: user.email,
      brand_name: brandName,
      domain,
      logo_url: logoUrl,
      primary_color: primaryColor || '#2176cc',
      secondary_color: secondaryColor || '#ea580c',
      support_email: supportEmail || user.email,
      feature_flags: featureFlags || {
        enable_teams: true,
        enable_api: true,
        enable_video_calls: true,
        enable_marketplace: true,
      },
      payment_settings: paymentSettings || {
        platform_fee_percentage: 18,
        use_custom_stripe: false,
      },
      is_active: true,
    });

    // In production, would trigger:
    // - DNS configuration
    // - SSL certificate generation
    // - Subdomain/custom domain routing setup

    return Response.json({
      success: true,
      brand,
      message: 'White-label brand created. Configure DNS to point to: api.surfcoast.io',
    });
  } catch (error) {
    console.error('Deploy white-label error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});