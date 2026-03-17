import React from 'react';
import { Star, Shield, Clock, Users } from 'lucide-react';

export default function TrustAndSocialProof() {

  return (
    <div className="bg-white py-16 border-t border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-slate-600">Real people, real reviews, real results</p>
        </div>

        {/* Trust Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">4.9/5</p>
            <p className="text-sm text-slate-600 mt-1">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">100%</p>
            <p className="text-sm text-slate-600 mt-1">Verified Profiles</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Clock className="w-8 h-8" style={{color: '#1E5A96'}} />
            </div>
            <p className="text-3xl font-bold text-slate-900">12 hrs</p>
            <p className="text-sm text-slate-600 mt-1">Avg Response Time</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">2.5K+</p>
            <p className="text-sm text-slate-600 mt-1">Active Pros</p>
          </div>
        </div>

        {/* Video Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-slate-50 rounded-xl p-6 border border-slate-200/50">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 font-light leading-relaxed">"{testimonial.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Before/After */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 rounded-xl p-8" style={{backgroundColor: 'rgba(30, 90, 150, 0.05)', borderColor: 'rgba(30, 90, 150, 0.2)', borderWidth: '1px'}}>
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">BEFORE SURFCOAST</p>
            <ul className="space-y-2 text-slate-700">
              <li className="flex gap-2">
                <span className="text-red-500">✗</span>
                <span>Unknown contractors, no verification</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500">✗</span>
                <span>3-4 week wait for quotes</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500">✗</span>
                <span>Overpriced agencies with no accountability</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500">✗</span>
                <span>No recourse if work is bad</span>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">WITH SURFCOAST</p>
            <ul className="space-y-2 text-slate-700">
              <li className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span>Verified, rated professionals</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span>Same-day quotes, often same-day work</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span>Transparent, fair pricing direct from professionals</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span>Dispute resolution, guarantees</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}