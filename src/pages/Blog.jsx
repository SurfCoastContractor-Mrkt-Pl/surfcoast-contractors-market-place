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
        const posts = await base44.entities.BlogPost.filter({ published: true }, '-published_at', 50);
        return posts && posts.length > 0 ? posts : DEMO_POSTS;
      } catch {
        return DEMO_POSTS;
      }
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
              <Link key={post.id} to={createPageUrl(`BlogDetail?slug=${post.slug}`)}>
                <BlogCard post={post} />
              </Link>
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
          <Link to={createPageUrl('FindContractors')}>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all">
              Browse Professionals <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}