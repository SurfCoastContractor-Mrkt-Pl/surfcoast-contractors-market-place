import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CartTierDisplay from '@/components/consumer/CartTierDisplay';
import MarketShopBrowser from '@/components/consumer/MarketShopBrowser';
import MyOrders from '@/components/consumer/MyOrders';
import SavedVendors from '@/components/consumer/SavedVendors';
import Wishlist from '@/components/consumer/Wishlist';
import PaymentMethods from '@/components/consumer/PaymentMethods';
import EmptyStateIllustration from '@/components/consumer/EmptyStateIllustration';
import { ShoppingBag, Award, ClipboardList, Heart, CreditCard, Leaf, Tag } from 'lucide-react';

export default function ConsumerHub() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) { navigate('/'); return; }
        setUserEmail(user.email);
        const profiles = await base44.entities.CustomerProfile.filter({ email: user.email });
        setIsRegistered(profiles && profiles.length > 0);
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };
    getUserEmail();
  }, []);

  const { data: consumerTier } = useQuery({
    queryKey: ['consumerTier', userEmail],
    queryFn: () => 
      userEmail 
        ? base44.entities.ConsumerTier.filter({ user_email: userEmail }).then(results => results?.[0] || null)
        : Promise.resolve(null),
    enabled: !!userEmail && !loading
  });

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div style={{ minHeight: "100vh", background: "#EBEBEC", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 10, background: "#FBF5EC", border: "0.5px solid #D9B88A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "3px 3px 0px #5C3500" }}>
            <ShoppingBag style={{ width: 28, height: 28, color: "#5C3500" }} />
          </div>
          <h2 style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 22, color: "#1A1A1B", marginBottom: 10 }}>Consumer Dashboard</h2>
          <p style={{ color: "#555", marginBottom: 24, lineHeight: 1.65, fontSize: 14, fontStyle: "italic" }}>
            You need a Consumer account to access this dashboard. Sign up to browse local vendors, earn badges, and track your orders.
          </p>
          <Link
            to={createPageUrl('ConsumerSignup')}
            style={{ display: "inline-block", padding: "11px 24px", background: "#1A1A1B", color: "#fff", fontWeight: 700, borderRadius: 6, textDecoration: "none", fontSize: 13, boxShadow: "3px 3px 0px #5C3500" }}
          >
            Register as a Consumer
          </Link>
          <p style={{ fontSize: 12, color: "#888", marginTop: 16 }}>
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", textDecoration: "underline", color: "#555", fontSize: 12 }}>Go back</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#EBEBEC", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1A1A1B", borderBottom: "1px solid #D0D0D2" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#5C3500", boxShadow: "3px 3px 0px #F0E0C0", flexShrink: 0 }}>
              <ShoppingBag style={{ width: 26, height: 26, color: "#F0E0C0" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(1.2rem, 3vw, 1.6rem)", color: "#fff", margin: 0 }}>
                Consumer Dashboard
              </h1>
              <p style={{ color: "#aaa", margin: "3px 0 0", fontSize: 13, fontStyle: "italic" }}>
                Shop vendors, earn badges, track orders
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Tabs */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
            {[
              { value: 'badges', label: 'Badges', icon: Award },
              { value: 'farmers', label: 'Farmers Market', icon: Leaf },
              { value: 'swapmeet', label: 'Swap Meet', icon: Tag },
              { value: 'saved', label: 'Saved', icon: Heart },
              { value: 'wishlist', label: 'Wishlist', icon: ShoppingBag },
              { value: 'orders', label: 'Orders', icon: ClipboardList },
              { value: 'payment', label: 'Payment', icon: CreditCard },
            ].map(tab => (
              <button key={tab.value} style={{ padding: "8px 16px", background: "#fff", border: "0.5px solid #D0D0D2", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#1A1A1B", cursor: "pointer", whiteSpace: "nowrap" }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Badges Tab */}
          <div className="space-y-6">
            {consumerTier ? (
              <CartTierDisplay consumerTier={consumerTier} />
            ) : (
              <EmptyStateIllustration 
                icon={Award}
                title="No Badges Yet"
                description="Start shopping to begin earning badges! Every $150 spent unlocks a new tier."
                actionLabel="Browse Vendors"
              />
            )}
          </div>

          {/* Farmers Market Tab */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">🌽</div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Farmers Market</h2>
                <p className="text-sm text-slate-500">Fresh produce, dairy, baked goods & more from local farms</p>
              </div>
            </div>
            <MarketShopBrowser lockedType="farmers_market" />
          </div>

          {/* Swap Meet Tab */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">🏷️</div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Swap Meet</h2>
                <p className="text-sm text-slate-500">Crafts, collectibles, clothing, tools & unique finds</p>
              </div>
            </div>
            <MarketShopBrowser lockedType="swap_meet" />
          </div>

          {/* Saved Vendors Tab */}
          <div className="space-y-6">
            <SavedVendors userEmail={userEmail} />
          </div>

          {/* Wishlist Tab */}
          <div className="space-y-6">
            <Wishlist />
          </div>

          {/* Orders Tab */}
          <div className="space-y-6">
            <MyOrders userEmail={userEmail} />
          </div>

          {/* Payment Methods Tab */}
          <div className="space-y-6">
            <PaymentMethods userEmail={userEmail} />
          </div>
        </div>
      </div>
    </div>
  );
}