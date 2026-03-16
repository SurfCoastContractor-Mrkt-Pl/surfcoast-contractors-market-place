import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const CONTRACTOR_BIOS = [
  "Been doing plumbing for about 12 years now. Mostly residential work but I'll take on bigger jobs. Fast turnaround, honest pricing.",
  "Electrician here. I do everything from basic rewiring to panel upgrades. Licensed. Not the cheapest but you get quality work.",
  "Carpenter specializing in remodels and finish work. Built a lot of kitchen cabinets, decks, that kind of thing. References available.",
  "HVAC guy with 15+ years experience. Know how to diagnose and fix just about anything. Available for emergency calls sometimes.",
  "Do painting, drywall, texture work. Commercial and residential. I'll prep surfaces right, not gonna cut corners.",
  "Landscaping and general yard work. Design and maintenance. I take pride in making spaces look good.",
  "General handy person. Doors, windows, minor plumbing, electrical basics, hanging stuff on walls. Good for odds and ends.",
  "Tile work - bathrooms, kitchens, floors. Been tiling for 8 years. I'm meticulous about grout and alignment.",
  "Roofing contractor. Shingles, repairs, inspections. Licensed and insured. Will give you an honest assessment.",
  "Carpenter and general contractor. Renovations, additions, custom work. References on request.",
  "Plumbing and drain cleaning. Fast service, fair rates. Been in this business for a long time.",
  "Electrician, residential and light commercial. Will work with your schedule. Give me a call for estimates.",
];

const CUSTOMER_BIOS = [
  "Homeowner in the area. Got a lot of projects around the house that need attention.",
  "Trying to fix up my place bit by bit. Always looking for reliable people.",
  "New house, lots of work to do. Looking for honest contractors.",
  "Business owner needing some maintenance and repair work done.",
  "Just moved in, need some updates and fixes. Willing to pay for quality.",
  "Renting the place out, need someone reliable for maintenance issues.",
  "DIY person but need professional help on the bigger stuff.",
  "Property manager handling multiple units. Need dependable service people.",
];

const CONTRACTOR_NAMES = [
  { first: 'Mike', last: 'Johnson' },
  { first: 'Dave', last: 'Rodriguez' },
  { first: 'Carlos', last: 'Martinez' },
  { first: 'Tom', last: 'Wilson' },
  { first: 'Steve', last: 'Brown' },
  { first: 'Kevin', last: 'Anderson' },
  { first: 'Luis', last: 'Garcia' },
  { first: 'Pat', last: 'Kelly' },
];

const CUSTOMER_NAMES = [
  { first: 'Sarah', last: 'Chen' },
  { first: 'Michelle', last: 'Thompson' },
  { first: 'Lisa', last: 'Anderson' },
  { first: 'Jennifer', last: 'White' },
  { first: 'Amanda', last: 'Davis' },
  { first: 'Rachel', last: 'Miller' },
];

const CITIES = [
  'Los Angeles, CA',
  'San Francisco, CA',
  'San Diego, CA',
  'Austin, TX',
  'Denver, CO',
  'Seattle, WA',
  'Portland, OR',
];

const TRADES = ['electrician', 'plumber', 'carpenter', 'hvac', 'painter', 'landscaper', 'roofer'];

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized: User not authenticated' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create demo contractors
    const contractors = [];
    for (let i = 0; i < 8; i++) {
      const name = CONTRACTOR_NAMES[i];
      const trade = randomPick(TRADES);
      const yearsExp = randomBetween(5, 20);
      const city = randomPick(CITIES);

      contractors.push({
        name: `${name.first} ${name.last}`,
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}_contractor_demo@surfcoast.local`,
        phone: `(${randomBetween(200, 999)}) ${randomBetween(200, 999)}-${randomBetween(1000, 9999)}`,
        contractor_type: 'trade_specific',
        trade_specialty: trade,
        location: city,
        years_experience: yearsExp,
        hourly_rate: randomBetween(65, 125),
        rating: parseFloat((randomBetween(42, 50) / 10).toFixed(1)),
        reviews_count: randomBetween(5, 150),
        bio: randomPick(CONTRACTOR_BIOS),
        certifications: [`${trade} License`],
        skills: ['Reliable', 'Fast', 'Clean work'],
        portfolio_images: [],
        identity_verified: true,
        completed_jobs_count: randomBetween(5, 150),
        is_featured: Math.random() > 0.7,
        photo_url: '',
        id_document_url: '',
        face_photo_url: '',
        availability_status: Math.random() > 0.15 ? 'available' : 'booked',
        is_demo: true,
        demo_expires_at: expiresAt.toISOString(),
      });
    }

    // Create demo customers
    const customers = [];
    for (let i = 0; i < 6; i++) {
      const name = CUSTOMER_NAMES[i];
      const city = randomPick(CITIES);

      customers.push({
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}_customer_demo@surfcoast.local`,
        full_name: `${name.first} ${name.last}`,
        phone: `(${randomBetween(200, 999)}) ${randomBetween(200, 999)}-${randomBetween(1000, 9999)}`,
        location: city,
        property_type: randomPick(['residential_house', 'residential_apartment', 'residential_condo']),
        bio: randomPick(CUSTOMER_BIOS),
        notify_job_updates: true,
        notify_messages: true,
        notify_payment_receipts: true,
        is_demo: true,
        demo_expires_at: expiresAt.toISOString(),
      });
    }

    // Bulk create contractors
    await base44.asServiceRole.entities.Contractor.bulkCreate(contractors);
    console.log(`Created ${contractors.length} demo contractors`);

    // Bulk create customers
    await base44.asServiceRole.entities.CustomerProfile.bulkCreate(customers);
    console.log(`Created ${customers.length} demo customers`);

    return Response.json({
      success: true,
      contractorsCreated: contractors.length,
      customersCreated: customers.length,
      expiresAt: expiresAt.toISOString(),
      note: 'Demo profiles created and visible to all visitors',
    });
  } catch (error) {
    console.error('Error creating demo profiles:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});