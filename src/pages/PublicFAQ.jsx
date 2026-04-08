import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search } from 'lucide-react';

export default function PublicFAQ() {
  const [faqs, setFAQs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const allFAQs = await base44.entities.FAQArticle.filter({
          is_published: true
        });
        setFAQs(allFAQs || []);

        // Extract unique categories
        const cats = [...new Set((allFAQs || []).map(f => f.category))].sort();
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Help Center</h1>
          <p className="text-slate-600">Find answers to common questions across all trades and professions</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            size="sm"
          >
            All Categories
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              size="sm"
            >
              {cat.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>

        {/* FAQs by Category */}
        {Object.keys(groupedFAQs).length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-slate-500">No FAQs found matching your search</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 capitalize">
                {category.replace(/_/g, ' ')}
              </h2>
              <div className="space-y-2">
                {categoryFAQs.map((faq) => (
                  <Card
                    key={faq.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-left">{faq.question}</CardTitle>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                            expandedId === faq.id ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </CardHeader>
                    {expandedId === faq.id && (
                      <CardContent className="pt-0">
                        <p className="text-slate-700 whitespace-pre-wrap">{faq.answer}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}