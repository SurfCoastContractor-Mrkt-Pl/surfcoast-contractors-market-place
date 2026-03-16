import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    // Demo contractors data
    const demoContractors = [
      {
        name: "Marcus Johnson",
        email: "marcus.plumber@demo.local",
        phone: "555-0101",
        contractor_type: "trade_specific",
        trade_specialty: "plumber",
        location: "Los Angeles, CA",
        hourly_rate: 85,
        years_experience: 12,
        bio: "Licensed plumber with 12 years experience. Specializes in residential repairs and installations. Fast, reliable, and affordable.",
        skills: ["Pipe repair", "Installation", "Leak detection", "Water heater service"],
        certifications: ["California Plumbing License #12345", "EPA Certified"],
        rating: 4.9,
        reviews_count: 48,
        completed_jobs_count: 156,
        unique_customers_count: 89,
        available: true,
        availability_status: "available",
        is_featured: true,
        identity_verified: true,
        id_document_url: "https://via.placeholder.com/400x300?text=License",
        face_photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        portfolio_images: ["https://via.placeholder.com/400x300?text=Before", "https://via.placeholder.com/400x300?text=After"],
        is_demo: true,
        demo_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: "Sarah Chen",
        email: "sarah.electrician@demo.local",
        phone: "555-0102",
        contractor_type: "trade_specific",
        trade_specialty: "electrician",
        location: "San Francisco, CA",
        hourly_rate: 95,
        years_experience: 10,
        bio: "Expert electrician. Residential & light commercial work. Licensed, insured, and guaranteed satisfaction.",
        skills: ["Wiring", "Circuit breakers", "Panel upgrades", "Safety inspections"],
        certifications: ["California Electrician License #67890", "OSHA Certified"],
        rating: 4.8,
        reviews_count: 62,
        completed_jobs_count: 203,
        unique_customers_count: 112,
        available: true,
        availability_status: "available",
        is_featured: true,
        identity_verified: true,
        id_document_url: "https://via.placeholder.com/400x300?text=License",
        face_photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        portfolio_images: ["https://via.placeholder.com/400x300?text=Before", "https://via.placeholder.com/400x300?text=After"],
        is_demo: true,
        demo_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: "David Rodriguez",
        email: "david.carpenter@demo.local",
        phone: "555-0103",
        contractor_type: "trade_specific",
        trade_specialty: "carpenter",
        location: "Austin, TX",
        hourly_rate: 75,
        years_experience: 15,
        bio: "Master carpenter. Custom builds, renovations, and repairs. Quality craftsmanship guaranteed.",
        skills: ["Framing", "Finishing", "Custom cabinetry", "Repairs"],
        certifications: ["Master Carpenter"],
        rating: 4.95,
        reviews_count: 87,
        completed_jobs_count: 312,
        unique_customers_count: 168,
        available: true,
        availability_status: "available",
        is_featured: true,
        identity_verified: true,
        id_document_url: "https://via.placeholder.com/400x300?text=License",
        face_photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
        photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
        portfolio_images: ["https://via.placeholder.com/400x300?text=Before", "https://via.placeholder.com/400x300?text=After"],
        is_demo: true,
        demo_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Demo jobs data
    const demoJobs = [
      {
        title: "Kitchen Faucet Replacement",
        customer_email: "customer1@demo.local",
        customer_name: "Jennifer Smith",
        description: "Need to replace old kitchen faucet with new modern one. Single hole, stainless steel preferred.",
        category: "plumbing",
        trade_specialty: "plumber",
        location: "Los Angeles, CA",
        urgency: "high",
        budget_min: 200,
        budget_max: 400,
        status: "open",
        is_demo: true,
        demo_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Electrical Panel Upgrade",
        customer_email: "customer2@demo.local",
        customer_name: "Michael Brown",
        description: "Need to upgrade 100-amp panel to 200-amp to support new HVAC system.",
        category: "electrical",
        trade_specialty: "electrician",
        location: "San Francisco, CA",
        urgency: "medium",
        budget_min: 800,
        budget_max: 1500,
        status: "open",
        is_demo: true,
        demo_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Deck Repair and Staining",
        customer_email: "customer3@demo.local",
        customer_name: "Amanda Lee",
        description: "Back deck needs repair of loose boards and restaining. 16x12 area.",
        category: "carpentry",
        trade_specialty: "carpenter",
        location: "Austin, TX",
        urgency: "low",
        budget_min: 500,
        budget_max: 1000,
        status: "open",
        is_demo: true,
        demo_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Bathroom Remodel",
        customer_email: "customer4@demo.local",
        customer_name: "Robert Wilson",
        description: "Full bathroom remodel. New tiles, fixtures, shower enclosure. Looking for complete solution.",
        category: "general",
        trade_specialty: "general",
        location: "Los Angeles, CA",
        urgency: "high",
        budget_min: 3000,
        budget_max: 6000,
        status: "open",
        is_demo: true,
        demo_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Create contractors
    let createdCount = 0;
    for (const contractor of demoContractors) {
      const existing = await base44.entities.Contractor.filter({ email: contractor.email });
      if (!existing || existing.length === 0) {
        await base44.entities.Contractor.create(contractor);
        createdCount++;
      }
    }

    // Create jobs
    for (const job of demoJobs) {
      const existing = await base44.entities.Job.filter({ title: job.title });
      if (!existing || existing.length === 0) {
        await base44.entities.Job.create(job);
        createdCount++;
      }
    }

    return Response.json({ 
      success: true, 
      message: `Created demo data. Total records: ${createdCount}`,
      contractors: demoContractors.length,
      jobs: demoJobs.length
    });
  } catch (error) {
    console.error('Seed demo data error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});