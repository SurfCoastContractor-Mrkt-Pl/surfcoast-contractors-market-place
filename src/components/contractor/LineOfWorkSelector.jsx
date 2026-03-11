import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const lineOfWorkOptions = [
  { category: 'Freelance', items: [
    { id: 'freelance_writer', name: 'Writer' },
    { id: 'freelance_designer', name: 'Designer' },
    { id: 'freelance_developer', name: 'Developer' },
    { id: 'freelance_photographer', name: 'Photographer' },
    { id: 'freelance_videographer', name: 'Videographer' },
  ]},
  { category: 'Art & Creative', items: [
    { id: 'artist_painter', name: 'Painter' },
    { id: 'artist_sculptor', name: 'Sculptor' },
    { id: 'musician', name: 'Musician' },
    { id: 'illustrator', name: 'Illustrator' },
    { id: 'animator', name: 'Animator' },
  ]},
  { category: 'Design', items: [
    { id: 'graphic_designer', name: 'Graphic Designer' },
    { id: 'web_designer', name: 'Web Designer' },
    { id: 'ux_designer', name: 'UX Designer' },
  ]},
  { category: 'Business & Consulting', items: [
    { id: 'consultant', name: 'Consultant' },
    { id: 'business_consultant', name: 'Business Consultant' },
    { id: 'product_manager', name: 'Product Manager' },
    { id: 'project_manager', name: 'Project Manager' },
    { id: 'marketing_specialist', name: 'Marketing Specialist' },
    { id: 'seo_specialist', name: 'SEO Specialist' },
    { id: 'copywriter', name: 'Copywriter' },
    { id: 'content_creator', name: 'Content Creator' },
    { id: 'social_media_manager', name: 'Social Media Manager' },
  ]},
  { category: 'Finance & Accounting', items: [
    { id: 'accountant', name: 'Accountant' },
    { id: 'bookkeeper', name: 'Bookkeeper' },
    { id: 'financial_advisor', name: 'Financial Advisor' },
  ]},
  { category: 'Tech & IT', items: [
    { id: 'virtual_assistant', name: 'Virtual Assistant' },
    { id: 'it_support', name: 'IT Support' },
    { id: 'cybersecurity_specialist', name: 'Cybersecurity Specialist' },
    { id: 'data_analyst', name: 'Data Analyst' },
    { id: 'computer_repair', name: 'Computer Repair' },
    { id: 'phone_repair', name: 'Phone Repair' },
  ]},
  { category: 'Education & Coaching', items: [
    { id: 'tutor_educator', name: 'Tutor/Educator' },
    { id: 'life_coach', name: 'Life Coach' },
    { id: 'business_consultant', name: 'Business Coach' },
  ]},
  { category: 'Health & Wellness', items: [
    { id: 'fitness_coach', name: 'Fitness Coach' },
    { id: 'personal_trainer', name: 'Personal Trainer' },
    { id: 'yoga_instructor', name: 'Yoga Instructor' },
    { id: 'nutritionist', name: 'Nutritionist' },
    { id: 'wellness_coach', name: 'Wellness Coach' },
    { id: 'therapist', name: 'Therapist' },
    { id: 'counselor', name: 'Counselor' },
  ]},
  { category: 'Services', items: [
    { id: 'translator', name: 'Translator' },
    { id: 'childcare_provider', name: 'Childcare Provider' },
    { id: 'house_cleaner', name: 'House Cleaner' },
    { id: 'organizer', name: 'Organizer' },
  ]},
  { category: 'Pet Services', items: [
    { id: 'pet_sitter', name: 'Pet Sitter' },
    { id: 'pet_groomer', name: 'Pet Groomer' },
    { id: 'dog_walker', name: 'Dog Walker' },
  ]},
  { category: 'Trades', items: [
    { id: 'electrician', name: 'Electrician' },
    { id: 'plumber', name: 'Plumber' },
    { id: 'hvac_technician', name: 'HVAC Technician' },
    { id: 'carpenter', name: 'Carpenter' },
    { id: 'mason', name: 'Mason' },
    { id: 'roofer', name: 'Roofer' },
    { id: 'painter', name: 'Painter' },
  ]},
  { category: 'Repairs & Maintenance', items: [
    { id: 'handyman', name: 'Handyman' },
    { id: 'locksmith', name: 'Locksmith' },
    { id: 'appliance_repair', name: 'Appliance Repair' },
  ]},
  { category: 'Outdoor & Landscape', items: [
    { id: 'landscaper', name: 'Landscaper' },
    { id: 'gardener', name: 'Gardener' },
    { id: 'tree_service', name: 'Tree Service' },
  ]},
  { category: 'Moving & Logistics', items: [
    { id: 'moving_service', name: 'Moving Service' },
    { id: 'courier', name: 'Courier' },
  ]},
];

export default function LineOfWorkSelector({ value, customValue, onChange, onCustomChange }) {
  const [customInput, setCustomInput] = useState(customValue || '');

  const handleCustomChange = (e) => {
    setCustomInput(e.target.value);
    onCustomChange(e.target.value);
  };

  const handleSelectChange = (newValue) => {
    onChange(newValue);
    if (newValue !== 'other') {
      setCustomInput('');
      onCustomChange('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="line_of_work">Line of Work *</Label>
        <Select value={value} onValueChange={handleSelectChange}>
          <SelectTrigger id="line_of_work" className="mt-1.5">
            <SelectValue placeholder="Select your profession or line of work" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {lineOfWorkOptions.map((group) => (
              <div key={group.category}>
                <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50">
                  {group.category}
                </div>
                {group.items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </div>
            ))}
            <div className="border-t border-slate-200">
              <SelectItem value="other">Other (Please specify)</SelectItem>
            </div>
          </SelectContent>
        </Select>
      </div>

      {value === 'other' && (
        <div>
          <Label htmlFor="line_of_work_other">Please describe your line of work *</Label>
          <Input
            id="line_of_work_other"
            value={customInput}
            onChange={handleCustomChange}
            placeholder="e.g., Software Architect, Social Media Influencer, etc."
            className="mt-1.5"
            required
          />
          <p className="text-xs text-slate-500 mt-1">
            Enter your specific profession or trade that wasn't listed above.
          </p>
        </div>
      )}
    </div>
  );
}