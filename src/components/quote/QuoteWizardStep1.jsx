import React from 'react';
import { Input } from '@/components/ui/input';

export default function QuoteWizardStep1({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Project Title</label>
        <Input
          type="text"
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          placeholder="e.g., Kitchen Remodel, New Deck"
          className="w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Project Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what you need done in detail..."
          rows="5"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Budget Range</label>
          <Input
            type="text"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g., $5,000 - $10,000"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Timeline</label>
          <Input
            type="text"
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            placeholder="e.g., ASAP, Within 2 weeks"
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Your Name</label>
          <Input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Your Email</label>
          <Input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="your@email.com"
            className="w-full"
            required
          />
        </div>
      </div>
    </div>
  );
}