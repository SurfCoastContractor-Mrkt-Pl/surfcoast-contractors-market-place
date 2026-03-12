import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const TRADES = ['electrician', 'plumber', 'carpenter', 'hvac', 'painter', 'mason', 'roofer', 'landscaper', 'welder', 'tiler'];
const FIRST_NAMES = ['John', 'Sarah', 'Mike', 'Maria', 'David', 'Jennifer', 'Robert', 'Lisa', 'James', 'Amy', 'William', 'Jessica', 'Richard', 'Emily', 'Joseph', 'Anna', 'Charles', 'Linda', 'Thomas', 'Carol'];
const LAST_NAMES = ['Johnson', 'Martinez', 'Chen', 'Garcia', 'Wilson', 'Anderson', 'Thompson', 'Taylor', 'Moore', 'Jackson', 'White', 'Harris', 'Martin', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young'];

const MAJOR_US_CITIES = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Denver, CO', 'Seattle, WA', 'Portland, OR', 'Miami, FL',
  'Atlanta, GA', 'Boston, MA', 'Washington, DC', 'Nashville, TN', 'Detroit, MI',
  'Memphis, TN', 'New Orleans, LA', 'Las Vegas, NV', 'Louisville, KY', 'Baltimore, MD',
  'Charlotte, NC', 'San Francisco, CA', 'Minneapolis, MN', 'Tucson, AZ', 'Sacramento, CA',
  'Kansas City, MO', 'Columbus, OH', 'Long Beach, CA', 'Albuquerque, NM', 'Mesa, AZ',
  'Virginia Beach, VA', 'Atlanta, GA', 'Fresno, CA', 'Sacramento, CA', 'Oakland, CA',
  'Cleveland, OH', 'Miami, FL', 'Tulsa, OK', 'Arlington, TX', 'Tampa, FL',
  'New Orleans, LA', 'Wichita, KS', 'Bakersfield, CA', 'Lexington, KY', 'Irving, TX'
];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateContractors(cityName, count, dayOffset) {
  const contractors = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = randomPick(FIRST_NAMES);
    const lastName = randomPick(LAST_NAMES);
    const trade = randomPick(TRADES);
    const yearsExp = randomBetween(5, 25);
    const rating = parseFloat((randomBetween(40, 50) / 10).toFixed(1));
    const reviewCount = randomBetween(10, 200);
    const hourlyRate = randomBetween(55, 150);
    
    // Vary created_date across the 30-day period
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - (30 - dayOffset - Math.floor(Math.random() * 5)));
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    contractors.push({
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}_demo@surfcoast.local`,
      phone: `(${randomBetween(200, 999)}) ${randomBetween(200, 999)}-${randomBetween(1000, 9999)}`,
      contractor_type: 'trade_specific',
      trade_specialty: trade,
      location: cityName,
      years_experience: yearsExp,
      hourly_rate: hourlyRate,
      rating: rating,
      reviews_count: reviewCount,
      available: Math.random() > 0.1, // 90% available
      bio: `Experienced ${trade} with ${yearsExp} years in the industry. Licensed and certified. Professional, reliable, and customer-focused.`,
      certifications: [`${trade} License`, 'EPA Certified'],
      skills: ['Communication', 'Problem Solving', 'Time Management', 'Quality Workmanship'],
      portfolio_images: [],
      identity_verified: true,
      completed_jobs_count: reviewCount,
      is_featured: Math.random() > 0.85, // 15% featured
      photo_url: '',
      id_document_url: 'https://base44.app/api/apps/69a61a047827463e7cdbc1eb/files/public/69a61a047827463e7cdbc1eb/demo-id.jpg',
      face_photo_url: '',
      availability_status: Math.random() > 0.1 ? 'available' : 'booked',
      is_demo: true,
      demo_expires_at: expiresAt.toISOString(),
      created_date: createdDate.toISOString()
    });
  }
  
  return contractors;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Verify admin access
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    let totalCreated = 0;
    const createdCities = [];
    
    // For each city, create 1-10 random contractors
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const cityName = MAJOR_US_CITIES[dayOffset % MAJOR_US_CITIES.length];
      const contractorCount = randomBetween(1, 10);
      
      const contractors = generateContractors(cityName, contractorCount, dayOffset);
      
      try {
        await base44.asServiceRole.entities.Contractor.bulkCreate(contractors);
        totalCreated += contractorCount;
        createdCities.push({ city: cityName, count: contractorCount });
      } catch (e) {
        console.error(`Failed to create contractors for ${cityName}:`, e.message);
      }
    }

    return Response.json({
      success: true,
      totalCreated,
      citiesPopulated: createdCities.length,
      breakdown: createdCities,
      note: '30-day demo campaign started. Contractors spread across all major US cities.'
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});