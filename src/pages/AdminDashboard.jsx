import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldOff, BarChart2, Store, HardHat, Star, Clock, Leaf, Tag, DollarSign, AlertTriangle, Eye, EyeOff, Flag, CheckCircle, Ban, ExternalLink, Wrench, MapPin, CreditCard, Shield, Link as LinkIcon, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [vendors, setVendors] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  // Filter states
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all');
  const [vendorTypeFilter, setVendorTypeFilter] = useState('all');
  const [vendorSearchFilter, setVendorSearchFilter] = useState('');
  const [contractorSubFilter, setContractorSubFilter] = useState('all');
  const [contractorAcctFilter, setContractorAcctFilter] = useState('all');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('all');

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        setIsAdmin(true);
        
        // Load data
        const [v, c, r] = await Promise.all([
          base44.entities.MarketShop.list('-created_date', 1000),
          base44.entities.Contractor.list('-created_date', 1000),
          base44.entities.VendorReview.list('-created_date', 1000),
        ]);
        
        setVendors(v || []);
        setContractors(c || []);
        setReviews(r || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  if (loading) {
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

  // Filtered data
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
      if (contractorSubFilter !== 'all' && c.subscription_status !== contractorSubFilter) return false;
      if (contractorAcctFilter !== 'all' && c.account_locked !== (contractorAcctFilter === 'locked')) return false;
      return true;
    });
  }, [contractors, contractorSubFilter, contractorAcctFilter]);

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      if (reviewStatusFilter !== 'all' && r.status !== reviewStatusFilter) return false;
      if (reviewRatingFilter !== 'all' && r.rating !== parseInt(reviewRatingFilter)) return false;
      return true;
    });
  }, [reviews, reviewStatusFilter, reviewRatingFilter]);

  const handleVendorApprove = async (id, shop) => {
    await base44.entities.MarketShop.update(id, { status: 'active', subscription_status: 'active' });
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'active', subscription_status: 'active' } : v));
  };

  const handleVendorSuspend = async (id) => {
    await base44.entities.MarketShop.update(id, { status: 'suspended' });
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'suspended' } : v));
  };

  const handleReviewHide = async (id) => {
    await base44.entities.VendorReview.update(id, { status: 'hidden' });
    setReviews(reviews.map(r => r.id === id ? { ...r, status: 'hidden' } : r));
  };

  const handleReviewShow = async (id) => {
    await base44.entities.VendorReview.update(id, { status: 'visible' });
    setReviews(reviews.map(r => r.id === id ? { ...r, status: 'visible' } : r));
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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {['overview', 'vendors', 'contractors', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard label="Active Vendors" value={activeVendors} color="text-green-400" />
              <StatCard label="Pending" value={pendingVendors} color="text-yellow-400" />
              <StatCard label="Suspended" value={suspendedVendors} color="text-red-400" />
              <StatCard label="Farmers Market" value={farmersMarketVendors} color="text-blue-400" />
              <StatCard label="Swap Meet" value={swapMeetVendors} color="text-purple-400" />
              <StatCard label="Monthly Revenue" value={`$${monthlyRevenue}`} color="text-amber-400" />
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {vendors.slice(0, 10).map(v => (
                  <div key={v.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{v.shop_name}</p>
                      <p className="text-xs text-slate-400">{v.email}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={v.status} />
                      <p className="text-xs text-slate-400 mt-1">{new Date(v.created_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VENDORS */}
        {activeTab === 'vendors' && (
          <div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <td className="px-6 py-4"><StatusBadge status={v.subscription_status || 'inactive'} /></td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{new Date(v.created_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {v.status !== 'active' && (
                            <button
                              onClick={() => handleVendorApprove(v.id, v)}
                              className="px-2 py-1 bg-green-700 hover:bg-green-600 text-xs font-medium text-white rounded"
                            >
                              Approve
                            </button>
                          )}
                          {v.status !== 'suspended' && (
                            <button
                              onClick={() => handleVendorSuspend(v.id)}
                              className="px-2 py-1 bg-red-700 hover:bg-red-600 text-xs font-medium text-white rounded"
                            >
                              Suspend
                            </button>
                          )}
                          <a
                            href={`/MarketShopProfile/${v.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-xs font-medium text-white rounded"
                          >
                            View
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
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Trade</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">City/State</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Sub Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Account</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Stripe Connected</th>
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
                      <td className="px-6 py-4"><StatusBadge status={c.subscription_status || 'inactive'} /></td>
                      <td className="px-6 py-4">{c.account_locked ? <StatusBadge status="locked" /> : <StatusBadge status="active" />}</td>
                      <td className="px-6 py-4">{c.stripe_account_setup_complete ? '✅' : '❌'}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{new Date(c.created_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === 'reviews' && (
          <div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={reviewStatusFilter}
                  onChange={e => setReviewStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
                >
                  <option value="all">All Status</option>
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
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
                      <td className="px-6 py-4 text-white">{r.shop_name}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{r.reviewer_name}</td>
                      <td className="px-6 py-4 text-yellow-400">{'⭐'.repeat(r.rating)}</td>
                      <td className="px-6 py-4 text-slate-300">{r.title}</td>
                      <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{new Date(r.created_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {r.status === 'visible' && (
                            <button
                              onClick={() => handleReviewHide(r.id)}
                              className="px-2 py-1 bg-red-700 hover:bg-red-600 text-xs font-medium text-white rounded"
                            >
                              Hide
                            </button>
                          )}
                          {r.status === 'hidden' && (
                            <button
                              onClick={() => handleReviewShow(r.id)}
                              className="px-2 py-1 bg-green-700 hover:bg-green-600 text-xs font-medium text-white rounded"
                            >
                              Show
                            </button>
                          )}
                          <button
                            onClick={() => handleReviewFlag(r.id, r.flagged)}
                            className={`px-2 py-1 text-xs font-medium text-white rounded ${r.flagged ? 'bg-orange-700' : 'bg-slate-600'}`}
                          >
                            {r.flagged ? 'Flagged' : 'Flag'}
                          </button>
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