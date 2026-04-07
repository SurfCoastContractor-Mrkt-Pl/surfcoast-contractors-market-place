import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <div style={{ minHeight: "100vh", background: "#EBEBEC" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 11, color: "#555", letterSpacing: "0.1em", marginBottom: 10 }}>// CONSUMER DASHBOARD</div>
          <h1 style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", color: "#1A1A1B", marginBottom: 8 }}>Consumer Dashboard</h1>
          <p style={{ color: "#555", fontSize: 14, fontStyle: "italic" }}>
            Shop from local vendors and booths, earn badges with every $150 purchase.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="badges" className="space-y-6">
          <TabsList 
            className="grid w-full grid-cols-7 relative overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, #8B6F47 0%, #7A5C2F 25%, #8B6F47 50%, #7A5C2F 75%, #8B6F47 100%), linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.3) 100%)',
              backgroundBlendMode: 'overlay',
              borderRadius: '8px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)'
            }}
          >
            <TabsTrigger value="badges" className="flex items-center gap-2 text-amber-50 font-semibold transition-all duration-200 hover:bg-black/10 data-[state=active]:bg-amber-900/60 data-[state=active]:text-white data-[state=active]:shadow-inner">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="farmers" className="flex items-center gap-2 text-amber-50 font-semibold transition-all duration-200 hover:bg-black/10 data-[state=active]:bg-amber-900/60 data-[state=active]:text-white data-[state=active]:shadow-inner">
              <Leaf className="w-4 h-4" />
              <span className="hidden sm:inline">Farmers</span>
              <span className="sm:hidden">🌽</span>
            </TabsTrigger>
            <TabsTrigger value="swapmeet" className="flex items-center gap-2 text-amber-50 font-semibold transition-all duration-200 hover:bg-black/10 data-[state=active]:bg-amber-900/60 data-[state=active]:text-white data-[state=active]:shadow-inner">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Swap Meet</span>
              <span className="sm:hidden">🏷️</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2 text-amber-50 font-semibold transition-all duration-200 hover:bg-black/10 data-[state=active]:bg-amber-900/60 data-[state=active]:text-white data-[state=active]:shadow-inner">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2 text-amber-50 font-semibold transition-all duration-200 hover:bg-black/10 data-[state=active]:bg-amber-900/60 data-[state=active]:text-white data-[state=active]:shadow-inner">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 text-amber-50 font-semibold transition-all duration-200 hover:bg-black/10 data-[state=active]:bg-amber-900/60 data-[state=active]:text-white data-[state=active]:shadow-inner">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2 text-amber-50 font-semibold transition-all duration-200 hover:bg-black/10 data-[state=active]:bg-amber-900/60 data-[state=active]:text-white data-[state=active]:shadow-inner">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Payment</span>
            </TabsTrigger>
          </TabsList>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
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
          </TabsContent>

          {/* Farmers Market Tab */}
          <TabsContent value="farmers" className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">🌽</div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Farmers Market</h2>
                <p className="text-sm text-slate-500">Fresh produce, dairy, baked goods & more from local farms</p>
              </div>
            </div>
            <MarketShopBrowser lockedType="farmers_market" />
          </TabsContent>

          {/* Swap Meet Tab */}
          <TabsContent value="swapmeet" className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">🏷️</div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Swap Meet</h2>
                <p className="text-sm text-slate-500">Crafts, collectibles, clothing, tools & unique finds</p>
              </div>
            </div>
            <MarketShopBrowser lockedType="swap_meet" />
          </TabsContent>

          {/* Saved Vendors Tab */}
          <TabsContent value="saved" className="space-y-6">
            <SavedVendors userEmail={userEmail} />
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <Wishlist />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <MyOrders userEmail={userEmail} />
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment" className="space-y-6">
            <PaymentMethods userEmail={userEmail} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Consumer Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-600">Get notified when you earn badges</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="font-medium text-slate-900">Show Profile on Leaderboard</p>
                    <p className="text-sm text-slate-600">Make your badge collection public</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}