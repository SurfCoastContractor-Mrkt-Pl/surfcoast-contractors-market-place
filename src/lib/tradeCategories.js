// Central config for all trade category SEO landing pages
export const TRADE_CATEGORIES = [
  {
    slug: 'plumbers',
    label: 'Plumbers',
    tradeKey: 'plumber',
    title: 'Find Licensed Plumbers Near You — SurfCoast CMP',
    metaDescription: 'Connect with licensed, vetted plumbers in your area. Compare profiles, read verified reviews, and hire with confidence on SurfCoast Marketplace.',
    heroHeadline: 'Find a Trusted Plumber Near You',
    heroSubline: 'Licensed, reviewed, and ready to work — browse local plumbers on SurfCoast.',
    about: `Plumbing issues can range from a minor dripping faucet to a full pipe burst — and choosing the wrong contractor can turn a small problem into a costly disaster. When hiring a plumber, always verify they hold a valid state plumbing license, carry liability insurance, and can provide references from recent jobs.

Ask your plumber for a written estimate before work begins. Reputable plumbers will outline the scope of work, parts needed, estimated hours, and total cost — not just a ballpark figure. Be wary of anyone who quotes verbally and asks for full payment upfront.

A licensed plumber should be familiar with your local building codes and know when a permit is required. Permitted work protects you as the homeowner — it means the work will be inspected and meets safety standards.

On SurfCoast, every contractor profile shows their license status, portfolio, and verified reviews from real clients. You can message a plumber directly once you've paid the small communication fee, ensuring serious inquiries only.`,
    tips: [
      'Ask for proof of a current state plumbing license.',
      "Verify they carry general liability and workers' comp insurance.",
      'Request a written scope of work and itemized estimate.',
      'Check for permits — major plumbing work usually requires one.',
      'Read verified reviews from past clients on their SurfCoast profile.',
    ],
    relatedTrades: ['electricians', 'hvac-technicians', 'general-contractors'],
  },
  {
    slug: 'electricians',
    label: 'Electricians',
    tradeKey: 'electrician',
    title: 'Find Licensed Electricians Near You — SurfCoast CMP',
    metaDescription: 'Hire verified, licensed electricians in your area. Browse profiles, verified reviews, and get connected fast on SurfCoast Marketplace.',
    heroHeadline: 'Find a Licensed Electrician Near You',
    heroSubline: 'Verified, insured, and locally available — hire an electrician you can trust.',
    about: `Electrical work is one of the most safety-critical trades. Faulty wiring is a leading cause of residential fires, which is why hiring a licensed electrician — not a handyman — is essential for any panel, wiring, or outlet work.

Always ask to see a current state electrical contractor license. For larger jobs, your electrician should pull the necessary permits with your local building department. Permitted electrical work means an inspector will verify it meets code — a critical protection for your home and insurance policy.

A reputable electrician will provide a written bid including labor, materials, and timeline. They should also be willing to explain what they're doing and why, especially for complex jobs like panel upgrades, EV charger installation, or rewiring projects.

SurfCoast electricians have verified identities and post real portfolio photos so you can see the quality of their work before reaching out.`,
    tips: [
      'Only hire state-licensed electrical contractors for panel or wiring work.',
      'Confirm they pull permits for any permitted-scope jobs.',
      'Get at least two written estimates for larger projects.',
      'Ask about their experience with your specific project type (e.g., EV charger, solar).',
      'Verify insurance before they begin any work on your property.',
    ],
    relatedTrades: ['plumbers', 'hvac-technicians', 'general-contractors'],
  },
  {
    slug: 'hvac-technicians',
    label: 'HVAC Technicians',
    tradeKey: 'hvac',
    title: 'Find HVAC Technicians & AC Repair Near You — SurfCoast CMP',
    metaDescription: 'Find certified HVAC technicians for heating, cooling, and air quality services. Browse local pros and hire with confidence on SurfCoast.',
    heroHeadline: 'Find a Reliable HVAC Technician Near You',
    heroSubline: 'Heating, cooling, and air quality experts — vetted and ready to help.',
    about: `Your HVAC system is one of the largest investments in your home. Whether you need a seasonal tune-up, emergency AC repair, or a full system replacement, finding a qualified HVAC technician is critical to getting reliable, cost-effective service.

Look for technicians who are EPA 608 certified — this is legally required for anyone handling refrigerants. For new system installations, contractors should also be licensed by your state, as improper installation can void manufacturer warranties and create safety hazards.

A trustworthy HVAC technician will diagnose the problem before recommending repairs, provide written estimates, and explain all your options — including repair vs. replace tradeoffs. Be cautious of anyone who pressures you into an immediate full replacement without a thorough diagnosis.

On SurfCoast, HVAC professionals list their certifications and service areas so you can find the right fit for your job quickly.`,
    tips: [
      'Verify EPA 608 certification for any refrigerant-related work.',
      'Ask if they service your specific equipment brand.',
      'Get a written estimate that includes parts and labor separately.',
      'Ask about warranty on both parts and workmanship.',
      'Schedule seasonal tune-ups — preventive maintenance saves money long-term.',
    ],
    relatedTrades: ['electricians', 'plumbers', 'general-contractors'],
  },
  {
    slug: 'carpenters',
    label: 'Carpenters',
    tradeKey: 'carpenter',
    title: 'Find Skilled Carpenters Near You — SurfCoast CMP',
    metaDescription: 'Browse local carpenters for framing, cabinetry, decks, and custom woodwork. Hire verified carpenters on SurfCoast Marketplace.',
    heroHeadline: 'Find a Skilled Carpenter Near You',
    heroSubline: 'Custom woodwork, framing, decks, and more — find a carpenter who takes pride in their craft.',
    about: `Carpentry spans an enormous range of work — from rough framing and structural repairs to fine finish carpentry, custom cabinetry, and decorative trim. The right carpenter for your job depends heavily on what you're building or repairing.

For structural framing, look for contractors with experience in your local building codes and who understand load-bearing requirements. For finish carpentry and cabinetry, ask to see portfolio examples — the quality of joinery, finish, and attention to detail will tell you everything.

A professional carpenter will provide a written quote that breaks down labor and materials, and will discuss lead times for custom work. Expect quality carpenters to be booked out — that's usually a sign of demand and reputation.

SurfCoast carpenters post portfolio photos directly on their profiles so you can evaluate their work style before starting a conversation.`,
    tips: [
      'Ask to see portfolio photos specific to your project type.',
      'Clarify whether they supply materials or if you do.',
      'Get a timeline commitment in writing for custom projects.',
      'For structural work, confirm they understand local building codes.',
      'Ask about their finishing process — staining, painting, sealing.',
    ],
    relatedTrades: ['painters', 'roofers', 'general-contractors'],
  },
  {
    slug: 'painters',
    label: 'Painters',
    tradeKey: 'painter',
    title: 'Find Professional Painters Near You — SurfCoast CMP',
    metaDescription: 'Hire local painters for interior, exterior, and commercial painting projects. Browse verified painter profiles on SurfCoast Marketplace.',
    heroHeadline: 'Find a Professional Painter Near You',
    heroSubline: 'Interior, exterior, and commercial — local painters ready for your next project.',
    about: `A quality paint job can transform a space — and a bad one can be an expensive mistake to undo. The difference between a professional painter and an amateur often comes down to preparation: proper surface prep, priming, and the right products for the environment.

Before hiring, ask about their prep process. Do they sand, caulk, and prime before painting? What brands and grades of paint do they use? A contractor who cuts corners on prep will often leave you with peeling, uneven, or premature wear — especially on exterior jobs.

Get a detailed written quote that specifies the number of coats, the paint brand and finish, what's included (trim, ceilings, doors), and what's excluded. Ask if they move furniture and protect floors and fixtures.

SurfCoast painters include before and after portfolio photos so you can judge the quality of their work and consistency of their finishes.`,
    tips: [
      'Ask specifically about their surface preparation process.',
      'Confirm the paint brand, grade, and number of coats in the written quote.',
      'Ask about their process for protecting floors, furniture, and fixtures.',
      'For exterior jobs, ask about caulking and priming weather-exposed areas.',
      'Check reviews for consistency — one great job is expected, a pattern is proof.',
    ],
    relatedTrades: ['carpenters', 'roofers', 'general-contractors'],
  },
  {
    slug: 'roofers',
    label: 'Roofers',
    tradeKey: 'roofer',
    title: 'Find Licensed Roofers Near You — SurfCoast CMP',
    metaDescription: 'Connect with licensed, insured roofers for repairs, replacements, and inspections. Find trusted roofers on SurfCoast Marketplace.',
    heroHeadline: 'Find a Licensed Roofer Near You',
    heroSubline: 'Repairs, replacements, and inspections — hire a roofer who stands behind their work.',
    about: `Your roof is your home's first defense against the elements. Whether you need a minor repair, a full replacement, or a pre-sale inspection, hiring a licensed, insured roofer is non-negotiable — roofing is one of the most commonly scammed trades.

Always verify a contractor's roofing license and insurance before allowing anyone on your roof. Roofing work involves significant liability — if a worker is injured on your property and the contractor lacks workers' comp, you could be held responsible.

Get at least two to three written estimates that specify materials (shingle brand, grade, and warranty), underlayment, flashing, and disposal of old materials. Be cautious of door-to-door roofers who appear right after a storm — many are storm chasers who do substandard work and disappear.

SurfCoast roofers list their license status, carry verified insurance documents, and have reviews from real local clients.`,
    tips: [
      "Always verify a roofing license and liability + workers' comp insurance.",
      'Get written estimates that specify materials, warranty, and cleanup.',
      'Ask about manufacturer warranties on shingles and contractor workmanship warranties.',
      'Be cautious of post-storm door-knockers — research before signing anything.',
      'Confirm they will pull required permits for full replacements.',
    ],
    relatedTrades: ['carpenters', 'painters', 'general-contractors'],
  },
  {
    slug: 'masons',
    label: 'Masons',
    tradeKey: 'mason',
    title: 'Find Skilled Masons & Masonry Contractors Near You — SurfCoast CMP',
    metaDescription: 'Find local masons for brickwork, stonework, concrete, and retaining walls. Browse verified masonry contractors on SurfCoast.',
    heroHeadline: 'Find a Skilled Mason Near You',
    heroSubline: 'Brickwork, stone, concrete, and hardscape — built to last by local masonry pros.',
    about: `Masonry work — whether brick, block, stone, or concrete — requires precise skill and an understanding of load, drainage, and long-term structural performance. A well-built retaining wall or brick facade can last a lifetime; a poorly built one can fail within years.

When hiring a mason, ask about their experience with your specific material and project type. Brick repointing is a very different skill from building a stone retaining wall or pouring a concrete foundation. Ask to see portfolio examples of similar completed projects.

Masonry pricing varies significantly based on material costs, which fluctuate. Get a written quote that locks in material prices and clarifies what happens if costs change. For structural masonry, confirm that permits are pulled and inspections passed.

SurfCoast masons post portfolio work with photos so you can assess craftsmanship before reaching out.`,
    tips: [
      'Ask for examples of work with your specific material (brick, stone, block, concrete).',
      'For structural projects, confirm permits and inspections are included.',
      'Get clarity on how material price fluctuations are handled in the contract.',
      'Ask about drainage planning — improper drainage ruins masonry quickly.',
      'Check that the mortar type matches the application (exterior, below-grade, etc.).',
    ],
    relatedTrades: ['landscapers', 'carpenters', 'general-contractors'],
  },
  {
    slug: 'landscapers',
    label: 'Landscapers',
    tradeKey: 'landscaper',
    title: 'Find Local Landscapers Near You — SurfCoast CMP',
    metaDescription: 'Hire skilled landscapers for lawn care, landscape design, and hardscape projects. Browse local landscaping pros on SurfCoast Marketplace.',
    heroHeadline: 'Find a Skilled Landscaper Near You',
    heroSubline: 'Lawn care, landscape design, and hardscaping — find local pros who love what they do.',
    about: `Landscaping encompasses everything from weekly lawn maintenance to full outdoor living space design and installation. Whether you need a one-time cleanup, a seasonal maintenance plan, or a complete backyard transformation, finding the right landscaper depends on the scope of your project.

For design and installation projects, ask to see a design plan before work begins — any reputable landscaper should be able to sketch or render what the finished space will look like. Confirm plant selection is suited to your local climate and soil conditions.

For ongoing maintenance, establish a clear schedule and scope in writing: what's included (mowing, edging, blowing, fertilizing, weed control), what's extra, and how service skips are handled.

SurfCoast landscapers post portfolio photos and availability so you can find someone who fits your schedule and style.`,
    tips: [
      'Ask for a design plan or sketch before agreeing to installation work.',
      'Confirm plant selection is appropriate for your local climate and soil.',
      'Get a written maintenance agreement that defines scope and schedule.',
      'Ask about irrigation — proper watering systems save money and plants.',
      'Confirm they handle debris disposal and cleanup after each visit.',
    ],
    relatedTrades: ['masons', 'painters', 'general-contractors'],
  },
  {
    slug: 'welders',
    label: 'Welders',
    tradeKey: 'welder',
    title: 'Find Skilled Welders Near You — SurfCoast CMP',
    metaDescription: 'Connect with local welders for metal fabrication, repairs, and custom work. Browse verified welding contractors on SurfCoast Marketplace.',
    heroHeadline: 'Find a Skilled Welder Near You',
    heroSubline: 'Metal fabrication, repairs, and custom builds — connect with local welding professionals.',
    about: `Welding is a highly specialized trade that spans dozens of processes and applications — from structural steel and pipe welding to ornamental ironwork and custom metal fabrication. The right welder for your job depends entirely on the process, materials, and application involved.

When hiring a welder, ask about their certification and experience with your specific process (MIG, TIG, stick, flux-core) and material (mild steel, stainless, aluminum). For structural or pressure applications, certifications like AWS D1.1 or ASME are critical.

A professional welder will assess your project, provide a written quote, and discuss material options. For decorative or custom work, ask to see portfolio examples — weld quality and aesthetic finish vary widely by skill level.

SurfCoast welders list their certifications, specializations, and portfolio photos so you can find the right match for your job.`,
    tips: [
      'Ask about their certification and experience with your specific welding process.',
      'For structural welds, require AWS or ASME certification documentation.',
      'Specify the base metal — different alloys require different expertise.',
      'Ask to see portfolio photos of similar completed work.',
      'Confirm they have proper ventilation and fire protection for your job site.',
    ],
    relatedTrades: ['general-contractors', 'masons', 'carpenters'],
  },
  {
    slug: 'tilers',
    label: 'Tilers',
    tradeKey: 'tiler',
    title: 'Find Tile Contractors & Tilers Near You — SurfCoast CMP',
    metaDescription: 'Hire skilled tilers for bathroom, kitchen, and floor tile installation. Browse verified tile contractors on SurfCoast Marketplace.',
    heroHeadline: 'Find a Skilled Tile Contractor Near You',
    heroSubline: 'Bathroom, kitchen, floors, and custom tile work — find local tilers who do it right.',
    about: `Tile installation is one of those trades where the quality difference between a skilled contractor and an amateur is immediately visible — and very expensive to redo. Grout lines, layout planning, and substrate preparation are what separate a professional tile job from a DIY disaster.

Before hiring, ask how they plan and lay out the tile for your space. A good tiler will dry-fit tile, plan grout joint spacing, and find the natural focal point of the room before applying any adhesive. Ask about their substrate preparation — tile laid over an improper substrate will crack, pop, or shift.

Confirm the type of mortar, grout, and sealer they'll use, especially for wet areas like showers and bathroom floors where waterproofing is critical. Ask whether they use a membrane system like Schluter for shower pans.

SurfCoast tilers post portfolio photos of completed work so you can evaluate their layout skills and grout line consistency.`,
    tips: [
      'Ask how they plan tile layout — starting point, grout line spacing, focal alignment.',
      'Confirm proper substrate preparation and waterproofing for wet areas.',
      'Ask about the mortar, grout, and sealer products they use.',
      'For shower pans, ask if they use a membrane system like Schluter or Wedi.',
      'Request photos of similar completed tile projects.',
    ],
    relatedTrades: ['plumbers', 'carpenters', 'painters'],
  },
  {
    slug: 'general-contractors',
    label: 'General Contractors',
    tradeKey: 'general',
    title: 'Find General Contractors Near You — SurfCoast CMP',
    metaDescription: 'Hire experienced general contractors for renovations, additions, and full project management. Browse local GCs on SurfCoast Marketplace.',
    heroHeadline: 'Find a Trusted General Contractor Near You',
    heroSubline: 'Full project management, renovations, and remodels — find a GC who gets it done.',
    about: `A general contractor (GC) is your project quarterback — they coordinate trades, manage timelines, pull permits, and are ultimately responsible for delivering your project on budget and on schedule. For any renovation or construction project involving multiple trades, hiring a qualified GC is usually the most cost-effective approach.

When vetting a GC, verify their contractor's license (required in most states for work above a certain dollar threshold), liability insurance, and workers' comp. Ask for references from projects similar in scope to yours — and actually call those references.

A professional GC will provide a detailed written contract that includes scope of work, materials, payment schedule, change order process, and project timeline. Be very cautious of any GC who wants a large upfront payment before work begins — a common red flag in the industry.

SurfCoast general contractors have verified identities, uploaded credential documents, and carry verified reviews from real project clients.`,
    tips: [
      'Verify state contractor license and check for any complaints or disciplinary actions.',
      "Confirm liability insurance and workers' comp are current.",
      'Call references — ask specifically about budget management and communication.',
      'Never pay more than 10-15% upfront; tie payments to project milestones.',
      'Get a detailed written contract with a change order clause before work begins.',
    ],
    relatedTrades: ['plumbers', 'electricians', 'hvac-technicians', 'carpenters', 'roofers'],
  },
];

export const TRADE_BY_SLUG = Object.fromEntries(TRADE_CATEGORIES.map(t => [t.slug, t]));
export const TRADE_BY_KEY = Object.fromEntries(TRADE_CATEGORIES.map(t => [t.tradeKey, t]));