import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const US_COUNTRY_CODES = ['US'];

Deno.serve(async (req) => {
  try {
    // Get IP-based country from Cloudflare headers (available on Deno Deploy)
    const cfCountry = req.headers.get('cf-ipcountry') || 
                      req.headers.get('x-vercel-ip-country') ||
                      req.headers.get('x-country-code') ||
                      'US'; // Default to US (fail open)

    const country = cfCountry.toUpperCase().trim();
    const allowed = country === 'XX' || US_COUNTRY_CODES.includes(country); // XX = unknown/local

    // Map country code to name for display
    const countryNames = {
      GB: 'United Kingdom', CA: 'Canada', AU: 'Australia', DE: 'Germany',
      FR: 'France', MX: 'Mexico', JP: 'Japan', CN: 'China', IN: 'India',
      BR: 'Brazil', ZA: 'South Africa', NG: 'Nigeria', KE: 'Kenya',
    };
    const countryName = country === 'US' ? 'United States' : (countryNames[country] || country);

    return Response.json({ allowed, country, countryName });
  } catch (error) {
    // Fail open — allow access if geo check fails
    return Response.json({ allowed: true, country: 'US', countryName: 'United States' });
  }
});