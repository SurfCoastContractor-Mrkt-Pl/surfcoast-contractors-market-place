import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader, Search } from 'lucide-react';
import BlogCard from '../components/blog/BlogCard';

const CATEGORIES = [
  'all',
  'guide',
  'contractor_spotlight',
  'industry_tips',
  'success_story',
  'announcement',
];

export default function Blog() {
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }),
  });

  const filtered = posts?.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-100 to-blue-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-3">Resources & Insights</h1>
          <p className="text-lg text-slate-600 font-light">
            Expert guides and industry perspectives
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              {cat === 'all' ? 'All Posts' : cat.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {filtered.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">No articles found</p>
            <p className="text-slate-500">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}