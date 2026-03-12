import React, { useState, useMemo } from 'react';
import { Search, MapPin, Briefcase, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ContractorCard from '@/components/contractors/ContractorCard';

const industryOptions = [
  { category: 'Construction & Trades', items: ['carpenter', 'electrician', 'plumber', 'hvac_technician', 'mason', 'roofer', 'painter', 'welder', 'tiler'] },
  { category: 'Entertainment & Performance', items: ['actor', 'voice_actor', 'director', 'producer', 'musician', 'singer', 'dancer', 'comedian', 'film_crew', 'cinematographer', 'sound_engineer'] },
  { category: 'Art & Design', items: ['artist_painter', 'artist_sculptor', 'illustrator', 'animator', 'graphic_designer', 'web_designer', 'ux_designer', 'interior_designer', 'fashion_designer'] },
  { category: 'Education', items: ['tutor_educator', 'teacher', 'professor', 'instructor', 'academic_coach', 'test_prep_tutor'] },
  { category: 'Health & Wellness', items: ['personal_trainer', 'fitness_coach', 'yoga_instructor', 'nutritionist', 'wellness_coach', 'therapist', 'counselor', 'massage_therapist'] },
  { category: 'Business & Consulting', items: ['consultant', 'business_consultant', 'product_manager', 'project_manager', 'marketing_specialist', 'seo_specialist', 'copywriter', 'content_creator', 'social_media_manager'] },
  { category: 'Finance & Accounting', items: ['accountant', 'bookkeeper', 'financial_advisor', 'tax_specialist'] },
  { category: 'Technology & IT', items: ['freelance_developer', 'software_engineer', 'it_support', 'cybersecurity_specialist', 'data_analyst', 'computer_repair', 'phone_repair'] },
  { category: 'Repairs & Maintenance', items: ['handyman', 'locksmith', 'appliance_repair'] },
  { category: 'Outdoor & Landscape', items: ['landscaper', 'gardener', 'tree_service'] },
  { category: 'Pet Services', items: ['pet_sitter', 'pet_groomer', 'dog_walker'] },
  { category: 'Lifestyle & Personal Services', items: ['virtual_assistant', 'translator', 'childcare_provider', 'house_cleaner', 'organizer', 'life_coach'] },
  { category: 'Moving & Logistics', items: ['moving_service', 'courier'] },
];

const roleNameMap = {
  'carpenter': 'Carpenter', 'electrician': 'Electrician', 'plumber': 'Plumber', 'hvac_technician': 'HVAC Technician',
  'mason': 'Mason', 'roofer': 'Roofer', 'painter': 'Painter', 'welder': 'Welder', 'tiler': 'Tiler',
  'actor': 'Actor', 'voice_actor': 'Voice Actor', 'director': 'Director', 'producer': 'Producer', 'musician': 'Musician',
  'singer': 'Singer', 'dancer': 'Dancer', 'comedian': 'Comedian', 'film_crew': 'Film Crew', 'cinematographer': 'Cinematographer',
  'sound_engineer': 'Sound Engineer', 'artist_painter': 'Painter', 'artist_sculptor': 'Sculptor', 'illustrator': 'Illustrator',
  'animator': 'Animator', 'graphic_designer': 'Graphic Designer', 'web_designer': 'Web Designer', 'ux_designer': 'UX Designer',
  'interior_designer': 'Interior Designer', 'fashion_designer': 'Fashion Designer', 'tutor_educator': 'Tutor', 'teacher': 'Teacher',
  'professor': 'Professor', 'instructor': 'Instructor', 'academic_coach': 'Academic Coach', 'test_prep_tutor': 'Test Prep Tutor',
  'personal_trainer': 'Personal Trainer', 'fitness_coach': 'Fitness Coach', 'yoga_instructor': 'Yoga Instructor', 'nutritionist': 'Nutritionist',
  'wellness_coach': 'Wellness Coach', 'therapist': 'Therapist', 'counselor': 'Counselor', 'massage_therapist': 'Massage Therapist',
  'consultant': 'Consultant', 'business_consultant': 'Business Consultant', 'product_manager': 'Product Manager', 'project_manager': 'Project Manager',
  'marketing_specialist': 'Marketing Specialist', 'seo_specialist': 'SEO Specialist', 'copywriter': 'Copywriter', 'content_creator': 'Content Creator',
  'social_media_manager': 'Social Media Manager', 'accountant': 'Accountant', 'bookkeeper': 'Bookkeeper', 'financial_advisor': 'Financial Advisor',
  'tax_specialist': 'Tax Specialist', 'freelance_developer': 'Developer', 'software_engineer': 'Software Engineer', 'it_support': 'IT Support',
  'cybersecurity_specialist': 'Cybersecurity Specialist', 'data_analyst': 'Data Analyst', 'computer_repair': 'Computer Repair', 'phone_repair': 'Phone Repair',
  'handyman': 'Handyman', 'locksmith': 'Locksmith', 'appliance_repair': 'Appliance Repair', 'landscaper': 'Landscaper', 'gardener': 'Gardener',
  'tree_service': 'Tree Service', 'pet_sitter': 'Pet Sitter', 'pet_groomer': 'Pet Groomer', 'dog_walker': 'Dog Walker', 'virtual_assistant': 'Virtual Assistant',
  'translator': 'Translator', 'childcare_provider': 'Childcare Provider', 'house_cleaner': 'House Cleaner', 'organizer': 'Organizer', 'life_coach': 'Life Coach',
  'moving_service': 'Moving Service', 'courier': 'Courier'
};

export default function ContractorSearchFilter({ contractors = [] }) {
  const [searchName, setSearchName] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Get unique locations from contractors
  const locations = useMemo(() => {
    const unique = [...new Set(contractors.map(c => c.location).filter(Boolean))];
    return unique.sort();
  }, [contractors]);

  // Get roles for selected industry
  const rolesForIndustry = useMemo(() => {
    if (!selectedIndustry) return [];
    const industry = industryOptions.find(ind => ind.category === selectedIndustry);
    return industry?.items || [];
  }, [selectedIndustry]);

  // Filter and sort contractors by rating
  const filteredContractors = useMemo(() => {
    return contractors
      .filter(contractor => {
        const matchesName = !searchName || 
          contractor.name.toLowerCase().includes(searchName.toLowerCase());
        
        const matchesCategory = !selectedCategory || 
          contractor.trade_specialty === selectedCategory;
        
        const matchesLocation = !selectedLocation || 
          contractor.location === selectedLocation;

        return matchesName && matchesCategory && matchesLocation;
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0)); // Sort by rating descending
  }, [contractors, searchName, selectedCategory, selectedLocation]);

  const hasActiveFilters = searchName || selectedCategory || selectedLocation;
  const resultCount = filteredContractors.length;

  const handleClearFilters = () => {
    setSearchName('');
    setSelectedCategory('');
    setSelectedLocation('');
    setShowResults(false);
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Find Contractors</h2>
          <p className="text-slate-600">Search by name, service, or location</p>
        </div>

        {/* Search and Filter Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Name Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Contractor name..."
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                setShowResults(true);
              }}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setShowResults(true);
              }}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Services</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, ' ').charAt(0).toUpperCase() + cat.replace(/_/g, ' ').slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setShowResults(true);
              }}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Badge */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-sm text-amber-900">
              {resultCount} contractor{resultCount !== 1 ? 's' : ''} found
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="ml-auto text-amber-700 hover:text-amber-900 hover:bg-amber-100"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div>
            {filteredContractors.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContractors.map(contractor => (
                  <ContractorCard key={contractor.id} contractor={contractor} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No contractors found</h3>
                <p className="text-slate-600 mb-4">Try adjusting your search filters</p>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </Card>
            )}
          </div>
        )}

        {!showResults && (
          <div className="text-center py-12 text-slate-500">
            <p>Use the search and filter options above to find contractors</p>
          </div>
        )}
      </div>
    </div>
  );
}