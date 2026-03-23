import React, { useEffect, useState } from 'react';
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
import { ShoppingBag, Award, Settings, ClipboardList, Heart, CreditCard } from 'lucide-react';

export default function ConsumerHub() {
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const user = await base44.auth.me();
        setUserEmail(user?.email || null);
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

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `
          url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M60 40 L100 20 L140 40 L140 80 L100 100 L60 80 Z" fill="rgba(253,224,71,0.08)"/><path d="M40 100 L60 80 L100 100 L80 120 Z" fill="rgba(253,224,71,0.06)"/></svg>')`,
        backgroundSize: '400px 400px',
        backgroundRepeat: 'repeat',
        backgroundColor: '#fefef0'
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Consumer Hub</h1>
          <p className="text-slate-600">
            Shop from local vendors and booths, earn badges with every $150 purchase.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="badges" className="space-y-6">
          <TabsList 
            className="grid w-full grid-cols-6 relative overflow-hidden"
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
            <TabsTrigger value="purchases" className="flex items-center gap-2 text-amber-50 font-semibold transition-all duration-200 hover:bg-black/10 data-[state=active]:bg-amber-900/60 data-[state=active]:text-white data-[state=active]:shadow-inner">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Shopping</span>
              <span className="sm:hidden">Shop</span>
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

          {/* Shopping Tab */}
          <TabsContent value="purchases" className="space-y-6">
            <MarketShopBrowser />
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