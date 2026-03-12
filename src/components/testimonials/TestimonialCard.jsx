import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function TestimonialCard({ testimonial }) {
  const rating = testimonial.overall_rating || 5;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
              }`}
            />
          ))}
        </div>
        <Quote className="w-5 h-5 text-slate-200" />
      </div>

      <p className="text-slate-700 mb-4 italic">"{testimonial.comment}"</p>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900">{testimonial.reviewer_name}</p>
          {testimonial.job_title && (
            <p className="text-sm text-slate-600">{testimonial.job_title}</p>
          )}
        </div>
        {testimonial.verified && (
          <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
            Verified
          </div>
        )}
      </div>
    </div>
  );
}