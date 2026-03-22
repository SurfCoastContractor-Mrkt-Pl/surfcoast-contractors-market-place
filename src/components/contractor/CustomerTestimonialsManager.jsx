import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Star, Plus, Trash2, Eye, Pin, Zap } from 'lucide-react';

export default function CustomerTestimonialsManager({ contractorId }) {
  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      customerName: 'John Smith',
      projectTitle: 'Kitchen Renovation',
      rating: 5,
      content: 'Exceptional work from start to finish. Highly professional and attention to detail was amazing. Would hire again!',
      date: '2026-03-10',
      pinned: true,
      verified: true
    },
    {
      id: 2,
      customerName: 'Sarah Johnson',
      projectTitle: 'Bathroom Remodel',
      rating: 5,
      content: 'Outstanding contractor. Great communication, stayed on timeline, and the quality exceeded expectations.',
      date: '2026-02-28',
      pinned: false,
      verified: true
    },
    {
      id: 3,
      customerName: 'Mike Davis',
      projectTitle: 'Deck Installation',
      rating: 4,
      content: 'Good work and reasonable pricing. Completed on time. Minor touch-ups needed but resolved quickly.',
      date: '2026-02-15',
      pinned: false,
      verified: true
    }
  ]);

  const [showForm, setShowForm] = useState(false);

  const togglePin = (id) => {
    setTestimonials(testimonials.map(t =>
      t.id === id ? { ...t, pinned: !t.pinned } : { ...t, pinned: false }
    ));
  };

  const deleteTestimonial = (id) => {
    setTestimonials(testimonials.filter(t => t.id !== id));
  };

  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Customer Testimonials</h2>
          <p className="text-sm text-slate-600 mt-1">Manage and showcase customer reviews on your profile</p>
        </div>
        <Button onClick={() => setShowForm(true)} gap="2">
          <Plus className="w-4 h-4" />
          Add Testimonial
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Add New Testimonial</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Customer Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g., Kitchen Renovation"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Testimonial</label>
              <textarea
                placeholder="What did the customer say about your work?"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-24 resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600">Save Testimonial</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Average Rating</p>
              <p className="text-3xl font-bold text-slate-900">{avgRating}⭐</p>
            </div>
            <Star className="w-5 h-5 text-amber-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Testimonials</p>
              <p className="text-3xl font-bold text-slate-900">{testimonials.length}</p>
            </div>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Verified</p>
              <p className="text-3xl font-bold text-green-600">{testimonials.filter(t => t.verified).length}</p>
            </div>
            <Zap className="w-5 h-5 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Testimonials List */}
      {testimonials.length > 0 ? (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({testimonials.length})</TabsTrigger>
            <TabsTrigger value="pinned">Featured ({testimonials.filter(t => t.pinned).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {testimonials.map(testimonial => (
              <Card key={testimonial.id} className={`p-4 ${testimonial.pinned ? 'border-l-4 border-l-amber-500 bg-amber-50' : ''}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{testimonial.customerName}</h4>
                      {testimonial.verified && (
                        <Badge className="bg-green-100 text-green-700 text-xs">✓ Verified</Badge>
                      )}
                      {testimonial.pinned && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">📌 Featured</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{testimonial.projectTitle}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array(testimonial.rating).fill('⭐').map((star, i) => (
                      <span key={i} className="text-sm">{star}</span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    {new Date(testimonial.date).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePin(testimonial.id)}
                      className="text-xs"
                    >
                      {testimonial.pinned ? (
                        <>
                          <Pin className="w-3 h-3" />
                          Featured
                        </>
                      ) : (
                        <>
                          <Pin className="w-3 h-3" />
                          Feature
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTestimonial(testimonial.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pinned" className="space-y-3">
            {testimonials.filter(t => t.pinned).map(testimonial => (
              <Card key={testimonial.id} className="p-4 border-l-4 border-l-amber-500 bg-amber-50">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{testimonial.customerName}</h4>
                    <p className="text-xs text-slate-600">{testimonial.projectTitle}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array(testimonial.rating).fill('⭐').map((star, i) => (
                      <span key={i} className="text-sm">{star}</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-700">"{testimonial.content}"</p>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-12 text-center">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">No testimonials yet</p>
          <Button onClick={() => setShowForm(true)}>Add Your First Testimonial</Button>
        </Card>
      )}
    </div>
  );
}