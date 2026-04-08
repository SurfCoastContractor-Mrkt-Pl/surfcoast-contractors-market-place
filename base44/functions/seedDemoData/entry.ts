import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * seedDemoData — Admin-only function to seed demo data for Jobs, Reviews, and ScopeOfWork.
 * Uses service role to bypass RLS restrictions.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const results = { jobs: 0, reviews: 0, scopes: 0, errors: [] };

    // ── JOBS ──────────────────────────────────────────────────────────────────
    const jobs = [
      {
        title: "Electrical Panel Upgrade — 200A Service",
        description: "Our 100A panel is at capacity. Need upgrade to 200A service to support new EV charger and hot tub. Home is 1,800 sq ft single story built in 1978.",
        contractor_type_needed: "trade_specific",
        trade_needed: "electrician",
        location: "San Diego, CA",
        budget_min: 2500, budget_max: 4000, budget_type: "fixed",
        start_date: "2026-04-20", duration: "1-2 days",
        poster_name: "Carlos Mendoza", poster_email: "carlos.mendoza@demo.surfcoast.com", poster_phone: "619-555-1001",
        status: "open", urgency: "medium",
        before_photo_urls: [
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600",
          "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600",
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600",
          "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=600"
        ]
      },
      {
        title: "Bathroom Remodel — Full Plumbing Rough-In",
        description: "Converting a half bath to full bathroom. Need rough-in for shower, sink relocation, and new toilet. 60-year-old copper pipe throughout.",
        contractor_type_needed: "trade_specific", trade_needed: "plumber",
        location: "Chula Vista, CA",
        budget_min: 3000, budget_max: 6000, budget_type: "negotiable",
        start_date: "2026-04-25", duration: "3-5 days",
        poster_name: "Maria Santos", poster_email: "maria.santos@demo.surfcoast.com", poster_phone: "619-555-2002",
        status: "open", urgency: "medium",
        before_photo_urls: [
          "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600",
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
          "https://images.unsplash.com/photo-1563293958-7e1d8d01c3b5?w=600",
          "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600"
        ]
      },
      {
        title: "AC Unit Replacement — 3-Ton Split System",
        description: "Current Lennox unit is 18 years old and failing. Need full 3-ton split system replacement including air handler in attic and condenser outside. 2,100 sq ft home.",
        contractor_type_needed: "trade_specific", trade_needed: "hvac",
        location: "Hemet, CA",
        budget_min: 5000, budget_max: 8000, budget_type: "fixed",
        start_date: "2026-04-15", duration: "1 day",
        poster_name: "James Whitfield", poster_email: "james.whitfield@demo.surfcoast.com", poster_phone: "951-555-3003",
        status: "open", urgency: "high",
        before_photo_urls: [
          "https://images.unsplash.com/photo-1606868306217-dbf5046868d2?w=600",
          "https://images.unsplash.com/photo-1621417348640-0b37b6cfe0d2?w=600",
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600",
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600",
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600"
        ]
      },
      {
        title: "Custom Built-In Bookshelves — Living Room",
        description: "Looking for a skilled carpenter to build floor-to-ceiling built-in bookshelves on a 14-foot wall. Need painted finish with integrated lighting. Open to design input.",
        contractor_type_needed: "trade_specific", trade_needed: "carpenter",
        location: "Escondido, CA",
        budget_min: 2000, budget_max: 4500, budget_type: "fixed",
        start_date: "2026-05-01", duration: "4-6 days",
        poster_name: "Rachel Kim", poster_email: "rachel.kim@demo.surfcoast.com", poster_phone: "760-555-4004",
        status: "open", urgency: "low",
        before_photo_urls: [
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
          "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600",
          "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600",
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
          "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600"
        ]
      },
      {
        title: "Home Office Interior Design Consultation",
        description: "Converting our garage into a home office/studio. Need help with space planning, lighting design, and furniture selection for a 400 sq ft space.",
        contractor_type_needed: "general",
        location: "Temecula, CA",
        budget_min: 800, budget_max: 2000, budget_type: "hourly",
        start_date: "2026-04-22", duration: "2-3 day consultation",
        poster_name: "Tyler Owens", poster_email: "tyler.owens@demo.surfcoast.com", poster_phone: "951-555-5005",
        status: "open", urgency: "medium",
        before_photo_urls: [
          "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600",
          "https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=600",
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600",
          "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600",
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600"
        ]
      }
    ];

    for (const job of jobs) {
      try {
        await base44.asServiceRole.entities.Job.create(job);
        results.jobs++;
      } catch (e) {
        results.errors.push(`Job "${job.title}": ${e.message}`);
      }
    }

    // ── REVIEWS ───────────────────────────────────────────────────────────────
    const reviews = [
      {
        contractor_name: "Marcus Rivera", contractor_email: "marcus.rivera@demo.surfcoast.com",
        reviewer_name: "Carlos Mendoza", reviewer_email: "carlos.mendoza@demo.surfcoast.com",
        reviewer_type: "client", job_title: "200A Panel Upgrade + EV Charger Install",
        overall_rating: 5, quality_rating: 5, punctuality_rating: 5, communication_rating: 5, professionalism_rating: 5,
        comment: "Marcus was absolutely outstanding. He upgraded our panel and installed the Tesla wall charger in one day. Pulled permits, passed inspection first try. Cleaned up everything spotless. Couldn't recommend him more highly.",
        verified: true, moderation_status: "approved", work_date: "2026-03-15"
      },
      {
        contractor_name: "Marcus Rivera", contractor_email: "marcus.rivera@demo.surfcoast.com",
        reviewer_name: "Linda Park", reviewer_email: "linda.park@demo.surfcoast.com",
        reviewer_type: "client", job_title: "Whole Home Rewire — Kitchen and Master Bath",
        overall_rating: 5, quality_rating: 5, punctuality_rating: 4, communication_rating: 5, professionalism_rating: 5,
        comment: "Marcus did a full kitchen and master bath rewire for us. Very professional, explained everything clearly, and his pricing was fair. Minor delay on day 2 but he communicated ahead of time. Will definitely hire again.",
        verified: true, moderation_status: "approved", work_date: "2026-02-20"
      },
      {
        contractor_name: "Sofia Castillo", contractor_email: "sofia.castillo@demo.surfcoast.com",
        reviewer_name: "Maria Santos", reviewer_email: "maria.santos@demo.surfcoast.com",
        reviewer_type: "client", job_title: "Water Heater Replacement + Pressure Regulator",
        overall_rating: 5, quality_rating: 5, punctuality_rating: 5, communication_rating: 5, professionalism_rating: 5,
        comment: "Sofia came out the same day our water heater failed. Replaced it in 3 hours and also found a bad pressure regulator we didn't know about. Saved us from a much bigger problem. Super knowledgeable and professional.",
        verified: true, moderation_status: "approved", work_date: "2026-03-08"
      },
      {
        contractor_name: "Sofia Castillo", contractor_email: "sofia.castillo@demo.surfcoast.com",
        reviewer_name: "Tom Hargrove", reviewer_email: "tom.hargrove@demo.surfcoast.com",
        reviewer_type: "client", job_title: "Master Bath Rough-In Plumbing",
        overall_rating: 4, quality_rating: 5, punctuality_rating: 4, communication_rating: 4, professionalism_rating: 5,
        comment: "Great quality work and passed city inspection. Took an extra day longer than quoted, but Sofia was upfront about it and didn't charge more. The workmanship is excellent.",
        verified: true, moderation_status: "approved", work_date: "2026-01-30"
      },
      {
        contractor_name: "Derek Thompson", contractor_email: "derek.thompson@demo.surfcoast.com",
        reviewer_name: "Rachel Kim", reviewer_email: "rachel.kim@demo.surfcoast.com",
        reviewer_type: "client", job_title: "Custom Kitchen Cabinets — Full Set",
        overall_rating: 5, quality_rating: 5, punctuality_rating: 5, communication_rating: 5, professionalism_rating: 5,
        comment: "Derek built us custom kitchen cabinets from scratch. The fit and finish is absolutely beautiful. He even suggested a pull-out shelf design we hadn't thought of. Masterful work, absolutely worth every penny.",
        verified: true, moderation_status: "approved", work_date: "2026-03-22"
      },
      {
        contractor_name: "Derek Thompson", contractor_email: "derek.thompson@demo.surfcoast.com",
        reviewer_name: "Steve Garrison", reviewer_email: "steve.garrison@demo.surfcoast.com",
        reviewer_type: "client", job_title: "Backyard Deck Build — 400 sq ft",
        overall_rating: 5, quality_rating: 5, punctuality_rating: 4, communication_rating: 5, professionalism_rating: 5,
        comment: "Derek built our entire backyard deck in composite decking. Looks incredible and it's rock solid. He took great pride in the details — even the underside framing was perfect. Would hire him for every project.",
        verified: true, moderation_status: "approved", work_date: "2026-02-14"
      },
      {
        contractor_name: "Aaliyah Brooks", contractor_email: "aaliyah.brooks@demo.surfcoast.com",
        reviewer_name: "Tyler Owens", reviewer_email: "tyler.owens@demo.surfcoast.com",
        reviewer_type: "client", job_title: "Home Office Design & Space Planning",
        overall_rating: 5, quality_rating: 5, punctuality_rating: 5, communication_rating: 5, professionalism_rating: 5,
        comment: "Aaliyah transformed our idea of a home office into something we didn't even know we wanted. Her 3D rendering before we bought a single piece of furniture was incredible. The final result looked exactly like the render. Hire her immediately.",
        verified: true, moderation_status: "approved", work_date: "2026-03-05"
      },
      {
        contractor_name: "Ray Nguyen", contractor_email: "ray.nguyen@demo.surfcoast.com",
        reviewer_name: "James Whitfield", reviewer_email: "james.whitfield@demo.surfcoast.com",
        reviewer_type: "client", job_title: "Full AC System Replacement",
        overall_rating: 5, quality_rating: 5, punctuality_rating: 5, communication_rating: 4, professionalism_rating: 5,
        comment: "Ray replaced our entire AC system in the middle of summer. He showed up at 7am sharp, had the new unit running by 3pm. House went from 88°F to 72°F. His pricing was transparent and fair. Great technician.",
        verified: true, moderation_status: "approved", work_date: "2026-03-18"
      }
    ];

    for (const review of reviews) {
      try {
        await base44.asServiceRole.entities.Review.create(review);
        results.reviews++;
      } catch (e) {
        results.errors.push(`Review for "${review.contractor_name}": ${e.message}`);
      }
    }

    // ── SCOPES OF WORK ────────────────────────────────────────────────────────
    const scopes = [
      {
        contractor_name: "Marcus Rivera", contractor_email: "marcus.rivera@demo.surfcoast.com",
        client_name: "Carlos Mendoza", client_email: "carlos.mendoza@demo.surfcoast.com",
        job_title: "200A Panel Upgrade + EV Charger Install",
        scope_summary: "Upgrade main electrical panel from 100A to 200A service. Pull permit with city of San Diego. Install Level 2 Tesla Wall Connector in garage. Replace main breaker and sub-panel. All work to code with inspection sign-off.",
        cost_type: "fixed", cost_amount: 3200,
        platform_fee_percentage: 18, platform_fee_amount: 576, contractor_payout_amount: 2624,
        agreed_work_date: "2026-03-15",
        expected_start_date: "2026-03-15T07:00:00", expected_completion_date: "2026-03-16T17:00:00",
        status: "closed", contractor_closeout_confirmed: true, client_closeout_confirmed: true,
        contractor_satisfaction_rating: "excellent", client_satisfaction_rating: "excellent",
        closed_date: "2026-03-16T17:30:00"
      },
      {
        contractor_name: "Sofia Castillo", contractor_email: "sofia.castillo@demo.surfcoast.com",
        client_name: "Maria Santos", client_email: "maria.santos@demo.surfcoast.com",
        job_title: "Water Heater Replacement + Pressure Regulator",
        scope_summary: "Remove and dispose of 50-gallon Rheem water heater. Supply and install new 50-gallon Bradford White unit. Replace faulty PRV (pressure reducing valve). Test all connections and verify proper temp/pressure.",
        cost_type: "fixed", cost_amount: 1450,
        platform_fee_percentage: 18, platform_fee_amount: 261, contractor_payout_amount: 1189,
        agreed_work_date: "2026-03-08",
        expected_start_date: "2026-03-08T09:00:00", expected_completion_date: "2026-03-08T15:00:00",
        status: "closed", contractor_closeout_confirmed: true, client_closeout_confirmed: true,
        contractor_satisfaction_rating: "excellent", client_satisfaction_rating: "excellent",
        closed_date: "2026-03-08T15:45:00"
      },
      {
        contractor_name: "Ray Nguyen", contractor_email: "ray.nguyen@demo.surfcoast.com",
        client_name: "James Whitfield", client_email: "james.whitfield@demo.surfcoast.com",
        job_title: "Full AC System Replacement — 3 Ton",
        scope_summary: "Remove existing Lennox 2-ton split system (condenser + air handler). Supply and install new 3-ton Carrier 16 SEER system. Replace evaporator coil. Vacuum and charge refrigerant. Test and balance airflow.",
        cost_type: "fixed", cost_amount: 6800,
        platform_fee_percentage: 18, platform_fee_amount: 1224, contractor_payout_amount: 5576,
        agreed_work_date: "2026-03-18",
        expected_start_date: "2026-03-18T07:00:00", expected_completion_date: "2026-03-18T17:00:00",
        status: "closed", contractor_closeout_confirmed: true, client_closeout_confirmed: true,
        contractor_satisfaction_rating: "excellent", client_satisfaction_rating: "excellent",
        closed_date: "2026-03-18T17:30:00"
      },
      {
        contractor_name: "Marcus Rivera", contractor_email: "marcus.rivera@demo.surfcoast.com",
        client_name: "Danielle Gibboney", client_email: "danielleyg@aol.com",
        job_title: "Kitchen Rewire + GFCI Upgrades",
        scope_summary: "Rewire kitchen circuits to modern code. Install dedicated 20A circuits for microwave, dishwasher, and refrigerator. Replace all outlets with GFCI where required. Install under-cabinet LED lighting circuit.",
        cost_type: "fixed", cost_amount: 2100,
        platform_fee_percentage: 18, platform_fee_amount: 378, contractor_payout_amount: 1722,
        agreed_work_date: "2026-04-10",
        expected_start_date: "2026-04-10T08:00:00", expected_completion_date: "2026-04-11T17:00:00",
        status: "approved", contractor_closeout_confirmed: false, client_closeout_confirmed: false
      }
    ];

    for (const scope of scopes) {
      try {
        await base44.asServiceRole.entities.ScopeOfWork.create(scope);
        results.scopes++;
      } catch (e) {
        results.errors.push(`Scope "${scope.job_title}": ${e.message}`);
      }
    }

    console.log('[SEED_DEMO] Done:', results);
    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error('[SEED_DEMO_ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});