import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const lineOfWorkOptions = [
  { category: 'Construction & Trades', items: [
    { id: 'carpenter', name: 'Carpenter' },
    { id: 'electrician', name: 'Electrician' },
    { id: 'plumber', name: 'Plumber' },
    { id: 'hvac_technician', name: 'HVAC Technician' },
    { id: 'mason', name: 'Mason' },
    { id: 'roofer', name: 'Roofer' },
    { id: 'painter', name: 'Painter' },
    { id: 'welder', name: 'Welder' },
    { id: 'tiler', name: 'Tiler' },
  ]},
  { category: 'Entertainment & Performance', items: [
    { id: 'actor', name: 'Actor' },
    { id: 'voice_actor', name: 'Voice Actor' },
    { id: 'director', name: 'Director' },
    { id: 'producer', name: 'Producer' },
    { id: 'musician', name: 'Musician' },
    { id: 'singer', name: 'Singer' },
    { id: 'dancer', name: 'Dancer' },
    { id: 'comedian', name: 'Comedian' },
    { id: 'film_crew', name: 'Film Crew' },
    { id: 'cinematographer', name: 'Cinematographer' },
    { id: 'sound_engineer', name: 'Sound Engineer' },
  ]},
  { category: 'Art & Design', items: [
    { id: 'artist_painter', name: 'Painter' },
    { id: 'artist_sculptor', name: 'Sculptor' },
    { id: 'illustrator', name: 'Illustrator' },
    { id: 'animator', name: 'Animator' },
    { id: 'graphic_designer', name: 'Graphic Designer' },
    { id: 'web_designer', name: 'Web Designer' },
    { id: 'ux_designer', name: 'UX Designer' },
    { id: 'interior_designer', name: 'Interior Designer' },
    { id: 'fashion_designer', name: 'Fashion Designer' },
  ]},
  { category: 'Education', items: [
    { id: 'homeschool_educator', name: 'Homeschool Educator' },
    { id: 'tutor_educator', name: 'Tutor' },
    { id: 'teacher', name: 'Teacher' },
    { id: 'professor', name: 'Professor' },
    { id: 'instructor', name: 'Instructor' },
    { id: 'academic_coach', name: 'Academic Coach' },
    { id: 'test_prep_tutor', name: 'Test Prep Tutor' },
  ]},
  { category: 'Health & Wellness', items: [
    { id: 'personal_trainer', name: 'Personal Trainer' },
    { id: 'fitness_coach', name: 'Fitness Coach' },
    { id: 'yoga_instructor', name: 'Yoga Instructor' },
    { id: 'nutritionist', name: 'Nutritionist' },
    { id: 'wellness_coach', name: 'Wellness Coach' },
    { id: 'therapist', name: 'Therapist' },
    { id: 'counselor', name: 'Counselor' },
    { id: 'massage_therapist', name: 'Massage Therapist' },
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
    { id: 'tax_specialist', name: 'Tax Specialist' },
  ]},
  { category: 'Technology & IT', items: [
    { id: 'freelance_developer', name: 'Developer' },
    { id: 'software_engineer', name: 'Software Engineer' },
    { id: 'it_support', name: 'IT Support' },
    { id: 'cybersecurity_specialist', name: 'Cybersecurity Specialist' },
    { id: 'data_analyst', name: 'Data Analyst' },
    { id: 'computer_repair', name: 'Computer Repair' },
    { id: 'phone_repair', name: 'Phone Repair' },
  ]},
  { category: 'Repairs & Maintenance', items: [
    { id: 'handyman', name: 'Handyman' },
    { id: 'locksmith', name: 'Locksmith' },
    { id: 'appliance_repair', name: 'Appliance Repair' },
    { id: 'auto_mechanic', name: 'Auto Mechanic' },
    { id: 'auto_electrician', name: 'Auto Electrician' },
    { id: 'auto_body_repair', name: 'Auto Body & Panel Repair' },
    { id: 'auto_detailing', name: 'Auto Detailing' },
    { id: 'windscreen_repair', name: 'Windscreen Repair' },
    { id: 'tyre_service', name: 'Tyre Service' },
    { id: 'roadside_assistance', name: 'Roadside Assistance' },
    { id: 'auto_ac_service', name: 'Auto A/C Service' },
  ]},
  { category: 'Outdoor & Landscape', items: [
    { id: 'landscaper', name: 'Landscaper' },
    { id: 'gardener', name: 'Gardener' },
    { id: 'tree_service', name: 'Tree Service' },
  ]},
  { category: 'Pet Services', items: [
    { id: 'pet_sitter', name: 'Pet Sitter' },
    { id: 'pet_groomer', name: 'Pet Groomer' },
    { id: 'dog_walker', name: 'Dog Walker' },
  ]},
  { category: 'Lifestyle & Personal Services', items: [
    { id: 'virtual_assistant', name: 'Virtual Assistant' },
    { id: 'translator', name: 'Translator' },
    { id: 'childcare_provider', name: 'Childcare Provider' },
    { id: 'house_cleaner', name: 'House Cleaner' },
    { id: 'organizer', name: 'Organizer' },
    { id: 'life_coach', name: 'Life Coach' },
  ]},
  { category: 'Moving & Logistics', items: [
    { id: 'moving_service', name: 'Moving Service' },
    { id: 'courier', name: 'Courier' },
  ]},
];

export default function LineOfWorkSelector({ value, customValue, onChange, onCustomChange }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customInput, setCustomInput] = useState(customValue || '');

  const handleCustomChange = (e) => {
    setCustomInput(e.target.value);
    onCustomChange(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleItemSelect = (itemId) => {
    onChange(itemId);
    setCustomInput('');
    onCustomChange('');
  };

  const handleOtherSelect = () => {
    onChange('other');
    setSelectedCategory('');
  };

  // Find current selection info
  const currentItem = lineOfWorkOptions
    .flatMap(g => g.items)
    .find(item => item.id === value);
  const currentCategory = lineOfWorkOptions
    .find(g => g.items.some(item => item.id === value))?.category;

  return (
    <div className="space-y-4">
      {/* Industry Category Selection */}
      <div>
        <Label htmlFor="industry_category" className="text-sm font-medium">Select Industry *</Label>
        <Select value={selectedCategory || currentCategory || ''} onValueChange={handleCategoryChange}>
          <SelectTrigger id="industry_category" className="mt-1.5">
            <SelectValue placeholder="Choose an industry" />
          </SelectTrigger>
          <SelectContent className="max-h-72 overflow-y-scroll" style={{scrollbarWidth: 'thin'}} onWheel={(e) => e.stopPropagation()}>
            {lineOfWorkOptions.map((group) => (
              <SelectItem key={group.category} value={group.category}>
                {group.category}
              </SelectItem>
            ))}
            <div className="border-t border-slate-200">
              <SelectItem value="other">Other</SelectItem>
            </div>
          </SelectContent>
        </Select>
      </div>

      {/* Sub-options based on selected category */}
      {selectedCategory && selectedCategory !== 'other' && (
        <div>
          <Label htmlFor="line_of_work" className="text-sm font-medium">Select Role *</Label>
          <Select value={value} onValueChange={handleItemSelect}>
            <SelectTrigger id="line_of_work" className="mt-1.5">
              <SelectValue placeholder="Choose a specific role" />
            </SelectTrigger>
            <SelectContent className="max-h-72 overflow-y-scroll" style={{scrollbarWidth: 'thin'}} onWheel={(e) => e.stopPropagation()}>
              {lineOfWorkOptions
                .find(g => g.category === selectedCategory)
                ?.items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              <div className="border-t border-slate-200">
                <SelectItem value="other">Other (Please specify)</SelectItem>
              </div>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Other option */}
      {selectedCategory === 'other' && (
        <div>
          <Label htmlFor="line_of_work_other" className="text-sm font-medium">Describe Your Profession *</Label>
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

      {/* Education spotlight banner */}
      {(selectedCategory === 'Education' || currentCategory === 'Education') && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎓</span>
            <div>
              <p className="font-bold text-amber-900 text-sm">Homeschool Educators — You're in High Demand!</p>
              <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                Families across the US are choosing homeschooling and need qualified, passionate educators. 
                <strong> Investing in our children's education today shapes tomorrow's world.</strong> 
                Create your profile and connect with families who value personalised learning.
              </p>
              <p className="text-amber-700 text-xs mt-2 font-medium">
                📚 List your subjects · Set your schedule · Empower young minds
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected value display */}
      {value && value !== 'other' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-sm text-blue-900">
          ✓ Selected: <strong>{currentItem?.name}</strong>
        </div>
      )}
    </div>
  );
}