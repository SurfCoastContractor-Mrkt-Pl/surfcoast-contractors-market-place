import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Loader2, ShieldOff, BarChart2, Store, HardHat, Star, Clock, Leaf, Tag, DollarSign, AlertTriangle, Eye, EyeOff, Flag, CheckCircle, Ban, ExternalLink, Wrench, MapPin, CreditCard, Shield, Link as LinkIcon, AlertCircle, User, Waves, Briefcase, BookOpen, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import HISLicenseReview from '@/components/admin/HISLicenseReview';
import SendVendorEmailModal from '@/components/admin/SendVendorEmailModal';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useRequireAuth('/admin');
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [vendors, setVendors] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [emailModalVendor, setEmailModalVendor] = useState(null);
  
  // Filter states
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all');
  const [vendorTypeFilter, setVendorTypeFilter] = useState('all');
  const [vendorSearchFilter, setVendorSearchFilter] = useState('');
  const [contractorSubFilter, setContractorSubFilter] = useState('all');
  const [contractorAcctFilter, setContractorAcctFilter] = useState('all');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const loadData = async () => {
      try {
        const [v, c, r] = await Promise.all([
          base44.entities.MarketShop.list('-created_date', 1000),
          base44.entities.Contractor.list('-created_date', 1000),
          base44.entities.VendorReview.list('-created_date', 1000),
        ]);
        setVendors(v || []);
        setContractors(c || []);
        setReviews(r || []);
      } catch (err) {
        console.error('AdminDashboard: data load error:', err);
      }
    };
    loadData();
  }, [user]);

  // All hooks must be declared before any conditional returns
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      if (vendorStatusFilter !== 'all' && v.status !== vendorStatusFilter) return false;
      if (vendorTypeFilter !== 'all' && v.shop_type !== vendorTypeFilter) return false;
      const searchTerm = vendorSearchFilter.toLowerCase();
      if (searchTerm && !v.shop_name?.toLowerCase().includes(searchTerm) && !v.email?.toLowerCase().includes(searchTerm)) return false;
      return true;
    });
  }, [vendors, vendorStatusFilter, vendorTypeFilter, vendorSearchFilter]);

  const filteredContractors = useMemo(() => {
    return contractors.filter(c => {
      if (contractorSubFilter !== 'all' && c.wave_shop_subscription_status !== contractorSubFilter) return false;
      if (contractorAcctFilter !== 'all' && c.account_locked !== (contractorAcctFilter === 'locked')) return false;
      return true;
    });
  }, [contractors, contractorSubFilter, contractorAcctFilter]);

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      if (reviewStatusFilter !== 'all' && r.moderation_status !== reviewStatusFilter) return false;
      if (reviewRatingFilter !== 'all' && r.overall_rating !== parseInt(reviewRatingFilter)) return false;
      return true;
    });
  }, [reviews, reviewStatusFilter, reviewRatingFilter]);

  const groupedVendors = useMemo(() => {
    const grouped = {};
    vendors.forEach(v => {
      if (!grouped[v.email]) grouped[v.email] = [];
      grouped[v.email].push(v);
    });

    return Object.entries(grouped)
      .sort((a, b) => {
        const latestA = new Date(a[1][0].created_date).getTime();
        const latestB = new Date(b[1][0].created_date).getTime();
        return latestB - latestA;
      })
      .slice(0, 10);
  }, [vendors]);

  // Early returns AFTER all hooks
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ShieldOff className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">You do not have permission to view this page.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Go Home
          </button>
        </div>

        {/* Email Modal */}
        {emailModalVendor && (
          <SendVendorEmailModal
            vendor={emailModalVendor}
            onClose={() => setEmailModalVendor(null)}
            onSuccess={() => setEmailModalVendor(null)}
          />
        )}
        </div>
        );
        }

  // Stats calculations
  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const pendingVendors = vendors.filter(v => v.status === 'pending').length;
  const suspendedVendors = vendors.filter(v => v.status === 'suspended').length;
  const farmersMarketVendors = vendors.filter(v => v.shop_type === 'farmers_market').length;
  const swapMeetVendors = vendors.filter(v => v.shop_type === 'swap_meet').length;
  const monthlyRevenue = activeVendors * 35;

  const handleVendorApprove = async (id, shop) => {
    await base44.entities.MarketShop.update(id, { status: 'active', wave_shop_subscription_status: 'active' });
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'active', wave_shop_subscription_status: 'active' } : v));
  };

  const handleVendorSuspend = async (id) => {
    await base44.entities.MarketShop.update(id, { status: 'suspended' });
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'suspended' } : v));
  };

  const handleReviewHide = async (id) => {
    await base44.entities.Review.update(id, { moderation_status: 'flagged_inappropriate' });
    setReviews(reviews.map(r => r.id === id ? { ...r, moderation_status: 'flagged_inappropriate' } : r));
  };

  const handleReviewShow = async (id) => {
    await base44.entities.Review.update(id, { moderation_status: 'approved' });
    setReviews(reviews.map(r => r.id === id ? { ...r, moderation_status: 'approved' } : r));
  };

  const handleReviewFlag = async (id, flagged) => {
    await base44.entities.VendorReview.update(id, { flagged: !flagged });
    setReviews(reviews.map(r => r.id === id ? { ...r, flagged: !flagged } : r));
  };

  const StatCard = ({ label, value, color, icon: Icon }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
        {Icon && <Icon className={`w-8 h-8 ${color} opacity-50`} />}
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const colors = {
      active: 'bg-green-900 text-green-200',
      pending: 'bg-yellow-900 text-yellow-200',
      suspended: 'bg-red-900 text-red-200',
      visible: 'bg-green-900 text-green-200',
      hidden: 'bg-red-900 text-red-200',
      inactive: 'bg-slate-700 text-slate-200',
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-slate-700'}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-slate-700 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0.5 sm:gap-1">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart2 },
              { key: 'vendors', label: 'Vendors', icon: Store },
              { key: 'contractors', label: 'Contractors', icon: HardHat },
              { key: 'reviews', label: 'Reviews', icon: Star },
              { key: 'his_licenses', label: 'HIS Licenses', icon: Waves },
              { key: 'field_ops', label: 'Wave FO', icon: Briefcase },
              { key: 'notion', label: 'Notion', icon: BookOpen },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
         {/* OVERVIEW */}
         {activeTab === 'overview' && (
           <div>
             <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-4 mb-6 sm:mb-8">
              <StatCard label="Active Vendors" value={activeVendors} color="text-green-400" icon={Store} />
              <StatCard label="Pending" value={pendingVendors} color="text-yellow-400" icon={Clock} />
              <StatCard label="Farmers Market" value={farmersMarketVendors} color="text-blue-400" icon={Leaf} />
              <StatCard label="Swap Meet" value={swapMeetVendors} color="text-purple-400" icon={Tag} />
              <StatCard label="Monthly Revenue" value={`$${monthlyRevenue}`} color="text-amber-400" icon={DollarSign} />
              <StatCard label="Suspended" value={suspendedVendors} color="text-red-400" icon={AlertTriangle} />
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2"><Clock className="w-4 sm:w-5 h-4 sm:h-5" />Recent Activity by Account</h2>
              <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                  {/* Group vendors by email, show latest first */}
                  {groupedVendors.map(([email, shops]) => {
                    const latestShop = shops[0];
                    const statuses = shops.map(s => s.status);
                    const uniqueStatuses = [...new Set(statuses)];

                    return (
                      <div key={email} className="p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white font-medium text-sm">{email}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{shops.length} shop{shops.length !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex gap-1 flex-wrap justify-end mb-1">
                              {uniqueStatuses.map(s => <StatusBadge key={s} status={s} />)}
                            </div>
                            <p className="text-xs text-slate-400">{new Date(latestShop.created_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {shops.length > 1 && (
                          <div className="text-xs text-slate-400 space-y-1 mt-2 pl-2 border-l border-slate-600">
                            {shops.map(s => (
                              <p key={s.id}>{s.shop_name} <span className="text-slate-500">({s.shop_type.replace('_', ' ')})</span></p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
            </div>
          </div>
        )}

        {/* VENDORS */}
        {activeTab === 'vendors' && (
          <div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={vendorSearchFilter}
                  onChange={e => setVendorSearchFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500"
                />
                <select
                  value={vendorStatusFilter}
                  onChange={e => setVendorStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={vendorTypeFilter}
                  onChange={e => setVendorTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
                >
                  <option value="all">All Types</option>
                  <option value="farmers_market">Farmers Market</option>
                  <option value="swap_meet">Swap Meet</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto bg-slate-800 border border-slate-700 rounded-xl">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-700 bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Shop Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Type</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Owner Email</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">City/State</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Sub Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Created</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredVendors.map(v => (
                    <tr key={v.id} className="hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4 text-white">{v.shop_name}</td>
                      <td className="px-6 py-4 text-slate-300 capitalize">{v.shop_type?.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{v.email}</td>
                      <td className="px-6 py-4 text-slate-400">{v.city}, {v.state}</td>
                      <td className="px-6 py-4"><StatusBadge status={v.status} /></td>
                      <td className="px-6 py-4"><StatusBadge status={v.wave_shop_subscription_status || 'inactive'} /></td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{new Date(v.created_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                       <div className="flex gap-2">
                         {v.status !== 'active' && (
                           <button
                             onClick={() => handleVendorApprove(v.id, v)}
                             className="p-1.5 bg-green-700 hover:bg-green-600 rounded transition-colors"
                             title="Approve"
                           >
                             <CheckCircle className="w-4 h-4 text-white" />
                           </button>
                         )}
                         {v.status !== 'suspended' && (
                           <button
                             onClick={() => handleVendorSuspend(v.id)}
                             className="p-1.5 bg-red-700 hover:bg-red-600 rounded transition-colors"
                             title="Suspend"
                           >
                             <Ban className="w-4 h-4 text-white" />
                           </button>
                         )}
                         <button
                           onClick={() => setEmailModalVendor(v)}
                           className="p-1.5 bg-purple-700 hover:bg-purple-600 rounded transition-colors"
                           title="Send Email"
                         >
                           <Mail className="w-4 h-4 text-white" />
                         </button>
                         <a
                           href={`/shop/${v.custom_slug}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="p-1.5 bg-blue-700 hover:bg-blue-600 rounded transition-colors"
                           title="View Profile"
                         >
                           <ExternalLink className="w-4 h-4 text-white" />
                         </a>
                       </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTRACTORS */}
        {activeTab === 'contractors' && (
          <div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <select
                  value={contractorSubFilter}
                  onChange={e => setContractorSubFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
                >
                  <option value="all">All Subscriptions</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={contractorAcctFilter}
                  onChange={e => setContractorAcctFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
                >
                  <option value="all">All Account Status</option>
                  <option value="active">Active</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto bg-slate-800 border border-slate-700 rounded-xl">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-700 bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Email</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300 flex items-center gap-1"><Wrench className="w-4 h-4" />Trade</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300 flex items-center gap-1"><MapPin className="w-4 h-4" />City/State</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300 flex items-center gap-1"><CreditCard className="w-4 h-4" />Sub Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300 flex items-center gap-1"><Shield className="w-4 h-4" />Account</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300 flex items-center gap-1"><LinkIcon className="w-4 h-4" />Stripe Connected</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredContractors.map(c => (
                    <tr key={c.id} className="hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4 text-white">{c.name}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{c.email}</td>
                      <td className="px-6 py-4 text-slate-300 capitalize">{c.trade_specialty?.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-slate-400">{c.location}</td>
                      <td className="px-6 py-4"><StatusBadge status={c.wave_shop_subscription_status || 'inactive'} /></td>
                      <td className="px-6 py-4">{c.account_locked ? <StatusBadge status="locked" /> : <StatusBadge status="active" />}</td>
                      <td className="px-6 py-4">{c.stripe_account_setup_complete ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Ban className="w-4 h-4 text-red-400" />}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{new Date(c.created_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WAVE FO */}
        {activeTab === 'field_ops' && (
          <div className="flex flex-col items-center justify-center py-20">
            <Briefcase className="w-12 h-12 text-blue-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Admin Wave FO</h2>
            <p className="text-slate-400 text-sm mb-6">Impersonate any contractor and view their Wave FO dashboard.</p>
            <Link
              to="/adminfieldops"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Open Admin Wave FO
            </Link>
          </div>
        )}

        {/* NOTION */}
        {activeTab === 'notion' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Notion Hub</h2>
            <p className="text-slate-400 text-sm mb-6 text-center max-w-sm">Manage project documentation and knowledge base articles linked to your Notion workspace.</p>
            <Link
              to="/NotionHub"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Notion Hub
            </Link>
          </div>
        )}

        {/* HIS LICENSES */}
        {activeTab === 'his_licenses' && (
          <HISLicenseReview
            contractors={contractors}
            onContractorUpdate={(id, updates) =>
              setContractors(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
            }
          />
        )}

        {/* REVIEWS */}
        {activeTab === 'reviews' && (
          <div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <select
                  value={reviewStatusFilter}
                  onChange={e => setReviewStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
                >
                  <option value="all">All Status</option>
                   <option value="approved">Approved</option>
                   <option value="flagged_inappropriate">Flagged</option>
                </select>
                <select
                  value={reviewRatingFilter}
                  onChange={e => setReviewRatingFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto bg-slate-800 border border-slate-700 rounded-xl">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-700 bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Shop Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Reviewer</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Rating</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Title</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Date</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredReviews.map(r => (
                    <tr key={r.id} className="hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4 text-white">{r.contractor_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs flex items-center gap-1"><User className="w-4 h-4" />{r.reviewer_name}</td>
                      <td className="px-6 py-4 text-yellow-400 flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < (r.overall_rating || 0) ? 'fill-amber-400' : ''}`} />
                      ))}</td>
                      <td className="px-6 py-4 text-slate-300">{r.job_title || 'N/A'}</td>
                      <td className="px-6 py-4"><StatusBadge status={r.moderation_status || 'pending'} /></td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{new Date(r.created_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {r.moderation_status === 'approved' && (
                            <button
                              onClick={() => handleReviewHide(r.id)}
                              className="p-1.5 bg-red-700 hover:bg-red-600 rounded transition-colors"
                              title="Flag Review"
                            >
                              <EyeOff className="w-4 h-4 text-white" />
                            </button>
                          )}
                          {r.moderation_status === 'flagged_inappropriate' && (
                            <button
                              onClick={() => handleReviewShow(r.id)}
                              className="p-1.5 bg-green-700 hover:bg-green-600 rounded transition-colors"
                              title="Unflag Review"
                            >
                              <Eye className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}