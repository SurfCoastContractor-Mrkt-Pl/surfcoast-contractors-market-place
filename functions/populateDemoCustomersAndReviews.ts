import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const FIRST_NAMES = ['John', 'Sarah', 'Mike', 'Maria', 'David', 'Jennifer', 'Robert', 'Lisa', 'James', 'Amy', 'William', 'Jessica', 'Richard', 'Emily', 'Joseph', 'Anna'];
const LAST_NAMES = ['Johnson', 'Martinez', 'Chen', 'Garcia', 'Wilson', 'Anderson', 'Thompson', 'Taylor', 'Moore', 'Jackson'];

const REVIEW_COMMENTS = [
  'Excellent work! Very professional and timely.',
  'Highly recommend. Great attention to detail.',
  'Amazing contractor. Will hire again for sure.',
  'Professional, reliable, and fair pricing.',
  'Great communication throughout the project.',
  'Quality workmanship and finished on time.',
  'Best contractor I\'ve worked with. Highly skilled.',
  'Impressed with the thoroughness and care taken.',
  'Professional team with outstanding results.',
  'Exceeded my expectations. Great value for money.',
];

const TESTIMONY_COMMENTS = [
  'This platform made finding a reliable contractor so easy. Highly satisfied!',
  'Great experience from start to finish. Would recommend to anyone.',
  'The contractors here are genuinely skilled and professional.',
  'Finally found someone I can trust to do quality work.',
  'Amazing service. The contractors are responsive and reliable.',
  'Best marketplace for finding skilled professionals.',
  'Would not hesitate to use this service again.',
  'Top-notch contractors and seamless experience.',
];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDemoCustomers(count) {
  const customers = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = randomPick(FIRST_NAMES);
    const lastName = randomPick(LAST_NAMES);
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - randomBetween(5, 30));
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    customers.push({
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}_demo@surfcoast.local`,
      full_name: `${firstName} ${lastName}`,
      phone: `(${randomBetween(200, 999)}) ${randomBetween(200, 999)}-${randomBetween(1000, 9999)}`,
      location: ['San Francisco, CA', 'Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Austin, TX'][i % 5],
      property_type: randomPick(['residential_house', 'residential_apartment', 'residential_condo']),
      bio: 'Demo customer account for testing platform.',
      is_demo: true,
      demo_expires_at: expiresAt.toISOString(),
      created_date: createdDate.toISOString(),
      completed_jobs_count: randomBetween(1, 15),
    });
  }
  
  return customers;
}

function generateReviews(contractorIds, customerIds) {
   const reviews = [];
   const contractorArray = Array.from(contractorIds);
   const customerArray = Array.from(customerIds);

   // Generate 3-8 reviews per contractor
   for (const contractorId of contractorArray) {
     const contractor = contractorId; // Will get full details in function
     const reviewCount = randomBetween(3, 8);

     for (let i = 0; i < reviewCount; i++) {
       const customer = randomPick(customerArray);
       // Mix of 3, 4, and 5 star ratings (weighted towards 4-5)
       const rating = randomBetween(1, 10) <= 2 ? 3 : randomBetween(4, 5);

       reviews.push({
         contractor_id: contractorId,
         contractor_name: '', // Will set in loop
         reviewer_name: '', // Will set in loop
         reviewer_email: customer.email,
         reviewer_type: 'customer',
         overall_rating: rating,
         quality_rating: randomBetween(3, 5),
         punctuality_rating: randomBetween(3, 5),
         communication_rating: randomBetween(3, 5),
         professionalism_rating: randomBetween(3, 5),
         comment: randomPick(REVIEW_COMMENTS),
         verified: true,
         is_testimony: false,
         work_date: (() => {
           const d = new Date();
           d.setDate(d.getDate() - randomBetween(10, 60));
           return d.toISOString().split('T')[0];
         })(),
       });
     }
   }

   return reviews;
}

function generateTestimonies(count) {
   const testimonies = [];

   for (let i = 0; i < count; i++) {
     const firstName = randomPick(FIRST_NAMES);
     const lastName = randomPick(LAST_NAMES);
     // Mix of 3, 4, and 5 star ratings for testimonies
     const rating = randomBetween(1, 10) <= 2 ? 3 : randomBetween(4, 5);

     testimonies.push({
       reviewer_name: `${firstName} ${lastName}`,
       reviewer_email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}_testimony@surfcoast.local`,
       reviewer_type: 'customer',
       overall_rating: rating,
       comment: randomPick(TESTIMONY_COMMENTS),
       is_testimony: true,
       verified: true,
     });
   }

   return testimonies;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized: User not authenticated' }, { status: 401 });
    }

    // Verify admin access
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all demo contractors
    const allContractors = await base44.asServiceRole.entities.Contractor.list();
    const demoContractors = allContractors.filter(c => c.is_demo);
    
    if (demoContractors.length === 0) {
      return Response.json({ error: 'No demo contractors found. Run populateDemoProfiles first.' }, { status: 400 });
    }

    // Create demo customers
    const demoCustomers = generateDemoCustomers(50);
    await base44.asServiceRole.entities.CustomerProfile.bulkCreate(demoCustomers);
    
    // Create reviews linking demo customers to demo contractors
    const reviews = generateReviews(
      demoContractors.map(c => c.id),
      demoCustomers.map(c => c.email)
    );
    
    // Attach contractor/customer names to reviews
    const reviewsWithNames = reviews.map((review, idx) => {
      const contractor = demoContractors.find(c => c.id === review.contractor_id);
      const customer = demoCustomers.find(c => c.email === review.reviewer_email);
      return {
        ...review,
        contractor_name: contractor?.name || 'Unknown',
        reviewer_name: customer?.full_name || `Demo Customer ${idx}`,
      };
    });
    
    await base44.asServiceRole.entities.Review.bulkCreate(reviewsWithNames);
    
    // Create standalone testimonies
    const testimonies = generateTestimonies(15);
    await base44.asServiceRole.entities.Review.bulkCreate(testimonies);

    return Response.json({
      success: true,
      customersCreated: demoCustomers.length,
      reviewsCreated: reviewsWithNames.length,
      testimoniesCreated: testimonies.length,
      contractorsReviewed: demoContractors.length,
      note: 'Demo customers, reviews, and testimonies created successfully. Demo profiles are now visible to all users.',
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});