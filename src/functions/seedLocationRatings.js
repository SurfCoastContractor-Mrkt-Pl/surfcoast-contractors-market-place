import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const SAMPLE_RATINGS = [
  {
    location_name: "Downtown Swap Meet",
    city: "Los Angeles",
    state: "CA",
    location_type: "swap_meet",
    rater_name: "John Vendor",
    rater_email: "john@example.com",
    cleanliness: 4,
    environment_comfort: 4,
    customer_purchase_rate: 5,
    safety_security: 4,
    foot_traffic: 5,
    space_layout: 3,
    overall_experience: 4,
    comments: "Great foot traffic and sales. Could be cleaner though."
  },
  {
    location_name: "Downtown Swap Meet",
    city: "Los Angeles",
    state: "CA",
    location_type: "swap_meet",
    rater_name: "Sarah Vendor",
    rater_email: "sarah@example.com",
    cleanliness: 3,
    environment_comfort: 3,
    customer_purchase_rate: 4,
    safety_security: 3,
    foot_traffic: 4,
    space_layout: 4,
    overall_experience: 4,
    comments: "Decent location, good visibility, slightly cramped spaces."
  },
  {
    location_name: "Venice Beach Flea Market",
    city: "Venice",
    state: "CA",
    location_type: "swap_meet",
    rater_name: "Mike Vendor",
    rater_email: "mike@example.com",
    cleanliness: 5,
    environment_comfort: 5,
    customer_purchase_rate: 4,
    safety_security: 5,
    foot_traffic: 4,
    space_layout: 5,
    overall_experience: 5,
    comments: "Excellent facilities and organization. Very professional setup."
  },
  {
    location_name: "Santa Monica Farmers Market",
    city: "Santa Monica",
    state: "CA",
    location_type: "farmers_market",
    rater_name: "Elena Vendor",
    rater_email: "elena@example.com",
    cleanliness: 5,
    environment_comfort: 4,
    customer_purchase_rate: 5,
    safety_security: 5,
    foot_traffic: 5,
    space_layout: 4,
    overall_experience: 5,
    comments: "Premium location with excellent customer base. Highly recommend!"
  },
  {
    location_name: "Santa Monica Farmers Market",
    city: "Santa Monica",
    state: "CA",
    location_type: "farmers_market",
    rater_name: "David Vendor",
    rater_email: "david@example.com",
    cleanliness: 4,
    environment_comfort: 4,
    customer_purchase_rate: 4,
    safety_security: 4,
    foot_traffic: 4,
    space_layout: 4,
    overall_experience: 4,
    comments: "Consistent, reliable location with steady traffic."
  },
  {
    location_name: "Hollywood Farmers Market",
    city: "Hollywood",
    state: "CA",
    location_type: "farmers_market",
    rater_name: "Lisa Vendor",
    rater_email: "lisa@example.com",
    cleanliness: 3,
    environment_comfort: 3,
    customer_purchase_rate: 3,
    safety_security: 3,
    foot_traffic: 3,
    space_layout: 2,
    overall_experience: 3,
    comments: "Average market, traffic could be better. Layout is confusing."
  },
  {
    location_name: "Long Beach Swap Meet",
    city: "Long Beach",
    state: "CA",
    location_type: "swap_meet",
    rater_name: "Tom Vendor",
    rater_email: "tom@example.com",
    cleanliness: 4,
    environment_comfort: 4,
    customer_purchase_rate: 4,
    safety_security: 4,
    foot_traffic: 4,
    space_layout: 4,
    overall_experience: 4,
    comments: "Solid all-around market. Good mix of customers."
  }
];

/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Use service role to bypass RLS
    const created = await base44.asServiceRole.entities.SwapMeetLocationRating.bulkCreate(SAMPLE_RATINGS);
    
    return Response.json({
      success: true,
      count: created.length,
      message: `Seeded ${created.length} location ratings`
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});