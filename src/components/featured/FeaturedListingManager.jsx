import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function FeaturedListingManager({ contractorEmail, contractorId }) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const { data: listings } = useQuery({
    queryKey: ['featured-listings', contractorEmail],
    queryFn: () => base44.entities.FeaturedListing.filter({ 
      contractor_email: contractorEmail,
      status: 'active'
    }),
    enabled: !!contractorEmail,
  });

  const activeListing = listings?.[0];
  const daysRemaining = activeListing ? Math.ceil(
    (new Date(activeListing.end_date) - new Date()) / (1000 * 60 * 60 * 24)
  ) : 0;

  const handleUpgrade = async () => {
    try {
      const response = await base44.functions.invoke('createFeaturedListingCheckout', {
        contractorId,
        contractorEmail,
      });
      if (response?.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {activeListing ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Star className="w-5 h-5 fill-amber-500" />
                Featured Status Active
              </CardTitle>
              <Badge className="bg-amber-500 text-white">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase">Expires In</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">{daysRemaining} days</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase">Monthly Cost</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">$29</p>
              </div>
            </div>
            <p className="text-sm text-amber-800">
              Your profile appears at the top of search results and contractor listings.
            </p>
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              Renew Featured Listing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-slate-400" />
              Get Featured
            </CardTitle>
            <CardDescription>Stand out from the competition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-700 font-semibold text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Top Search Results</p>
                  <p className="text-sm text-slate-600">Appear first when customers search</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-700 font-semibold text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Featured Badge</p>
                  <p className="text-sm text-slate-600">Attract more clients with a premium badge</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-700 font-semibold text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Higher Visibility</p>
                  <p className="text-sm text-slate-600">Get more job inquiries and quotes</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-center">
                <span className="text-3xl font-bold text-slate-900">$29</span>
                <span className="text-slate-600">/month</span>
              </p>
            </div>

            <Button 
              onClick={handleUpgrade}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
              size="lg"
            >
              Upgrade to Featured
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}