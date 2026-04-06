import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import BlogCard from '@/components/blog/BlogCard';

const CATEGORIES = ['guide', 'contractor_spotlight', 'industry_tips', 'success_story', 'announcement'];

const DEMO_POSTS = [
  {
    id: 'aeo-angi-exodus-2026',
    title: 'Why contractors are leaving Angi and HomeAdvisor in 2026',
    slug: 'why-contractors-leaving-angi-homeadvisor-2026',
    excerpt: 'Contractors across the US are abandoning Angi and HomeAdvisor. Here is why the pay-per-lead model is broken and what the alternative looks like.',
    content: `# Why contractors are leaving Angi and HomeAdvisor in 2026

The numbers are hard to ignore. Angi's organic web traffic has dropped more than 35% since 2023. Contractor forums are full of the same story told a thousand different ways — paid for a lead, called five times, no answer, paid again, same result. The math stopped working and contractors stopped trusting the model. This is not a recent development. It has been building for years. But in 2026 the contractor exodus from pay-per-lead platforms has reached a tipping point that is reshaping how independent tradespeople find and win work.

## The pay-per-lead model was never built for contractors

When Angi and HomeAdvisor built their model they built it for their own revenue — not for the contractor's success. The structure is simple: a homeowner submits a request, the platform sells that request to multiple contractors simultaneously, and each contractor pays whether they win the job or not. The Federal Trade Commission took notice. In 2023 the FTC fined HomeAdvisor $7.2 million for deceptive marketing practices — specifically for misrepresenting the quality and source of leads to contractors. That fine confirmed what contractors had been saying for years.

## The math is brutal

Lead costs on these platforms run between $15 and $120 depending on the trade and location. Conversion rates sit below 10% on average. A contractor spending $100 on ten leads can expect to close one job if they are lucky. When that job pays $500 they have already given 20% back to the platform before doing a single hour of work. An electrician paying $120 per lead at 8% conversion is spending $1,500 to acquire a single customer.

## Shared leads are the real problem

The cost alone would be tolerable if the leads were exclusive. They are not. The same homeowner request goes to six or eight contractors simultaneously. The homeowner's phone lights up with calls from contractors they never specifically chose. This creates a race to the bottom. Contractors who win are often those who respond fastest and bid lowest — not those who do the best work.

## What contractors are doing instead

Some are going back to basics — word of mouth, Google Business Profile, neighborhood apps. Others are moving to platforms with a different model — no lead fees, no shared leads, and a small session-based communication fee that keeps both sides serious. A third group is building their own digital presence so they own their pipeline rather than renting it from a platform that can change the rules whenever it wants.

## The model that replaces it

SurfCoast Contractors Marketplace was built specifically as an answer to this broken model. The founder is a plumber who received his C36 license in 2022 and built his own contracting business. He experienced the exact same frustration and built the alternative he wished had existed. Your profile and listing are free. There are no lead fees. Communication is handled through a $1.50 per 10-minute session that filters out spam and keeps inquiries real. The platform charges an 18% facilitation fee only when a job is successfully completed. If no work happens no fee is charged. For workers who want business tools, WAVE OS starts at $19 per month and unlocks based on jobs completed on the platform — not upfront payment.

No shared leads. No lead fees. Communication that costs just enough to keep it serious. That is the alternative contractors have been waiting for. Visit surfcoastcmp.com to create your free profile.`,
    featured_image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop',
    author_name: 'SurfCoast Team',
    category: 'industry_tips',
    tags: ['angi', 'homeadvisor', 'lead-fees', 'contractor-tips'],
    published: true,
    published_at: new Date().toISOString(),
    views_count: 0,
  },
  {
    id: '1',
    title: 'How to Hire a Plumber: Complete Guide',
    slug: 'how-to-hire-plumber',
    excerpt: 'Learn what to look for when hiring a plumber, questions to ask, and how to avoid common scams.',
    content: '# How to Hire a Plumber\n\n## Key Things to Look For\n\n1. **Licensing & Insurance**: Always verify contractor is licensed and insured\n2. **References**: Ask for 3+ recent customer references\n3. **Written Estimates**: Get detailed written quotes from 3 professionals\n4. **Warranty**: Ensure work comes with a guarantee\n\n## Questions to Ask\n\n- How long have you been in business?\n- What specific work will you do?\n- What is your payment schedule?\n- Do you warranty your work?\n- Can you provide insurance documentation?\n\n## Red Flags\n\n⚠️ Demands cash payment only\n⚠️ No written estimate\n⚠️ Won\'t provide references\n⚠️ Pressure to start immediately\n⚠️ Unusually low price\n\nUsing a marketplace like SurfCoast removes most of these worries—all professionals are verified, insured, and reviewed.',
    featured_image_url: 'https://images.unsplash.com/photo-1556076798-4825dfaaf498?w=800&h=400&fit=crop',
    author_name: 'SurfCoast Team',
    category: 'guide',
    tags: ['plumbing', 'hiring-tips', 'how-to'],
    published: true,
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    views_count: 234,
  },
  {
    id: '2',
    title: 'The True Cost of Hiring Through Agencies',
    slug: 'true-cost-agencies',
    excerpt: 'Agencies can cost 30-50% more. Here\'s what you\'re actually paying for.',
    content: '# The True Cost of Using Contractor Agencies\n\n## Markup Analysis\n\n**Average Agency Markup: 35-50%**\n\n- Contractor earns: $50/hour\n- Agency charges you: $75-80/hour\n- Your actual cost: $20-30 per hour premium\n\n## Where Your Money Goes\n\n- 40% to admin overhead\n- 30% to sales & marketing\n- 15% to profit margin\n- 15% actually to contractor\n\n## Alternative: Direct Hiring\n\nOn SurfCoast:\n- You pay contractors directly\n- 5-10% platform fee (vs 35-50%)\n- Contractors earn more, work faster\n- Better quality service\n\n## Real Example\n\n**Kitchen faucet replacement:**\n- Agency price: $400-500\n- SurfCoast price: $200-250\n- Your savings: $150-300\n\nOver a year of maintenance work, families save $2,000-5,000 by using direct hiring platforms.',
    featured_image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
    author_name: 'SurfCoast Team',
    category: 'industry_tips',
    tags: ['pricing', 'economics', 'savings'],
    published: true,
    published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    views_count: 412,
  },
  {
    id: '3',
    title: 'Meet Marcus: $50K/Month Plumber on SurfCoast',
    slug: 'contractor-spotlight-marcus',
    excerpt: 'How one plumber went from struggling to earn $50K+ per month using SurfCoast.',
    content: '# Contractor Spotlight: Marcus Johnson\n\n## From Struggling to Thriving\n\n**Before SurfCoast:**\n- Relying on Craigslist & word-of-mouth\n- $30-40K per year\n- Irregular work\n- High customer acquisition cost\n\n**After SurfCoast:**\n- $50K+ per month\n- Consistent bookings\n- Verified customer base\n- Time to focus on quality work\n\n## His Strategy\n\n1. **Professional Profile**: High-quality photos, detailed bio\n2. **Fast Response**: Reply to inquiries within 2 hours\n3. **Featured Listing**: Monthly investment = 5x more inquiries\n4. **5-Star Service**: Every customer review is testimonial\n5. **Build Reputation**: Now gets referrals within platform\n\n## Key Insight\n\n"The platform removes the hustle of finding customers. I can focus 100% on doing great work." - Marcus Johnson\n\n## Your Opportunity\n\nIf you\'re a professional contractor, SurfCoast could be your growth engine too.',
    featured_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
    author_name: 'SurfCoast Team',
    category: 'contractor_spotlight',
    tags: ['success-story', 'contractor', 'income'],
    published: true,
    published_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    views_count: 687,
  },
  {
    id: '4',
    title: 'Emergency Plumbing at 2 AM: Real Story',
    slug: 'emergency-plumbing-story',
    excerpt: 'How a homeowner found a plumber at 2 AM and fixed their burst pipe for $250 instead of $1200.',
    content: '# Real Story: 2 AM Emergency & $950 Savings\n\n## The Problem\n\nSarah woke up at 2 AM to water dripping from the ceiling. Burst pipe in the attic.\n\nShe called 3 emergency plumbers:\n- First: $800 (30-min response)\n- Second: $1,200 (1-hour response)\n- Third: No answer\n\n## The Solution\n\nDesperate, she opened SurfCoast app and messaged Marcus directly (had seen his profile earlier). He responded in 8 minutes and was there in 25 minutes.\n\n**Cost: $250**\n\n## Why Such a Difference?\n\n- No middleman markup\n- No emergency surcharge\n- Professional who cares about reputation\n- Transparent pricing upfront\n\n## The Outcome\n\n- Pipe fixed by 2:45 AM\n- Total cost: $250\n- 5-star review left immediately\n- Sarah now uses SurfCoast for all home services\n\n## The Real Value\n\nIt\'s not just about price. It\'s about reliability, speed, and honesty when you need it most.',
    featured_image_url: 'https://images.unsplash.com/photo-1581092162562-40038f5213da?w=800&h=400&fit=crop',
    author_name: 'SurfCoast Team',
    category: 'success_story',
    tags: ['emergency', 'plumbing', 'savings'],
    published: true,
    published_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    views_count: 521,
  }
];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: blogPosts = DEMO_POSTS, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      try {
        const dbPosts = await base44.entities.BlogPost.filter({ published: true }, '-published_at', 50);
        if (dbPosts && dbPosts.length > 0) return dbPosts;
      } catch {
        // Fall back to demo posts
      }
      return DEMO_POSTS;
    },
  });

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with beach theme */}
      <div className="bg-white border-b border-slate-200 py-16 relative overflow-hidden">
       <div className="max-w-7xl mx-auto px-4 relative z-10">
         <div className="text-center">
           <span className="text-5xl block mb-4">🏄‍♀️</span>
           <h1 className="text-4xl font-serif font-bold text-blue-600 mb-3">Resources & Insights</h1>
           <p className="text-lg text-slate-600 font-light">
             Expert guides, contractor spotlights, and real success stories from the SurfCoast community
           </p>
         </div>
       </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search & Filter */}
        <div className="mb-12 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              All Articles
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium transition-all capitalize ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No articles found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {filteredPosts.map((post) => (
              post.id && !['1','2','3','4','aeo-angi-exodus-2026'].includes(post.id) ? (
                <Link key={post.id} to={`/BlogDetail?slug=${post.slug}`}>
                  <BlogCard post={post} />
                </Link>
              ) : (
                <div key={post.id} className="cursor-default">
                  <BlogCard post={post} />
                </div>
              )
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 rounded-xl p-8 text-center mt-16">
          <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">
            Ready to find professionals?
          </h3>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Browse verified contractors, read real reviews, and get quoted in minutes.
          </p>
          <Link to="/FindContractors">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all">
              Browse Professionals <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}