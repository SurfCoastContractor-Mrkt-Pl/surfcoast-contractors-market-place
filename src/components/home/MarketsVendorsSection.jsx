import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Store, TrendingUp, Users, Leaf, Tag, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Feature = ({ icon: Icon, title, description }) => (
  <div className="flex gap-3 sm:gap-4">
    <div className="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-blue-100 flex items-center justify-center">
      <Icon className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
    </div>
    <div>
      <h4 className="font-semibold text-slate-900 text-sm sm:text-base">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-600 mt-1">{description}</p>
    </div>
  </div>
);

export default function MarketsVendorsSection() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const loadVendors = async () => {
      try {
        const data = await base44.entities.MarketShop.filter({ status: 'active', is_active: true }, '-created_date', 6);
        setVendors(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadVendors();
  }, []);

  const filteredVendors = selectedType === 'all' 
    ? vendors 
    : vendors.filter(v => v.shop_type === selectedType);

  const VendorCard = ({ vendor }) => (
    <Link to={`/shop/${vendor.custom_slug || vendor.id}`} className="group">
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-300 h-full flex flex-col">
        {/* Banner */}
        {vendor.banner_url ? (
          <div className="h-32 sm:h-40 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
            <img src={vendor.banner_url} alt={vendor.shop_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          </div>
        ) : (
          <div className="h-32 sm:h-40 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
            <Store className="w-12 h-12 text-blue-300" />
          </div>
        )}

        {/* Content */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">{vendor.shop_name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{vendor.city}, {vendor.state}</p>
          
          {/* Categories */}
          {vendor.categories && vendor.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {vendor.categories.slice(0, 2).map((cat, i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {cat}
                </span>
              ))}
              {vendor.categories.length > 2 && (
                <span className="text-xs text-slate-500 px-2 py-1">+{vendor.categories.length - 2}</span>
              )}
            </div>
          )}

          {/* Description */}
          {vendor.description && (
            <p className="text-xs text-slate-600 mt-3 line-clamp-2 flex-1">{vendor.description}</p>
          )}

          {/* Shop Type Badge */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              vendor.shop_type === 'farmers_market'
                ? 'bg-green-100 text-green-700'
                : vendor.shop_type === 'swap_meet'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {vendor.shop_type === 'farmers_market' ? 'Farmers Market' : vendor.shop_type === 'swap_meet' ? 'Swap Meet' : 'Market'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Store className="w-6 sm:w-7 h-6 sm:h-7 text-blue-600" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              Markets & Vendors
            </h2>
          </div>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect with your community. Build your brand. Grow your business beyond four walls. Our marketplace brings local vendors and curious shoppers together—whether you're selling produce at the farmers market, vintage finds at swap meets, or handmade goods.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16">
          <Feature
            icon={TrendingUp}
            title="Real Visibility & Growth"
            description="Get discovered by hundreds of local shoppers actively looking for what you offer. Built-in exposure across our platform."
          />
          <Feature
            icon={Users}
            title="Direct Customer Connection"
            description="Build relationships with buyers. Chat, answer questions, and turn shoppers into loyal customers who keep coming back."
          />
          <Feature
            icon={Leaf}
            title="Celebrate Your Business"
            description="Showcase your story, photos, and products. A beautiful profile that tells customers exactly who you are and what makes you special."
          />
          <Feature
            icon={TrendingUp}
            title="More Opportunities"
            description="Market appearances, special events, customer inquiries—all managed in one simple dashboard. Grow at your own pace."
          />
        </div>

        {/* Vendor Preview */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Featured Vendors</h3>
            <Link to="/MarketDirectory" className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All Markets' },
              { key: 'farmers_market', label: '🌾 Farmers Market' },
              { key: 'swap_meet', label: '🏷️ Swap Meet' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedType === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white border border-slate-300 text-slate-700 hover:border-slate-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Vendor Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No vendors found yet</p>
              <p className="text-sm text-slate-400 mt-1">Check back soon for featured vendors!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredVendors.map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center text-white">
          <h3 className="text-2xl sm:text-3xl font-bold mb-2">Ready to Join Our Marketplace?</h3>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto text-sm sm:text-base">
            Whether you're a seasoned vendor or just starting out, we've made it simple to set up your shop and start reaching customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/MarketShopSignup">
              <Button className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 font-semibold min-h-[44px]">
                Start Selling
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/MarketDirectory">
              <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-blue-600 font-semibold min-h-[44px]">
                Browse Vendors
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}