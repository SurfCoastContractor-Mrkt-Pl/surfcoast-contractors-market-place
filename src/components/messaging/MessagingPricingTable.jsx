import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, MessageCircle, Zap, Star } from 'lucide-react';
import PaymentGate from '@/components/payment/PaymentGate';

export default function MessagingPricingTable({ contractorId, contractorName, contractorEmail, open, onClose, onMessagingUnlocked }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const plans = [
    {
      id: 'quote',
      name: 'Quote Request',
      price: '$1.75',
      duration: 'per contractor',
      features: [
        'Blind written estimate',
        'No back-and-forth needed',
        'Contractor reviews at own pace',
      ],
      icon: MessageCircle,
      priceId: process.env.REACT_APP_STRIPE_QUOTE_PRICE_ID,
      badge: 'Most Popular',
      customerOnly: true,
    },
    {
      id: 'timed',
      name: '10-Minute Chat',
      price: '$1.50',
      duration: 'one-time',
      features: [
        'Real-time messaging',
        '10 minute session',
        'For agreed work only',
      ],
      icon: Zap,
      priceId: process.env.REACT_APP_STRIPE_LIMITED_COMM_PRICE_ID,
    },
    {
      id: 'subscription',
      name: 'Monthly Access',
      price: '$50',
      duration: '/month',
      features: [
        'Up to 15 unique contacts',
        '5 sessions per contact',
        'Unlimited messaging within sessions',
      ],
      icon: Star,
      priceId: process.env.REACT_APP_STRIPE_SUBSCRIPTION_PRICE_ID,
      badge: 'Best Value',
    },
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentOpen(false);
    onMessagingUnlocked(selectedPlan.id);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <MessageCircle className="w-6 h-6 text-amber-500" />
              Message {contractorName}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6">
            <p className="text-slate-600 text-center mb-8">
              Choose how you'd like to communicate with this contractor
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <Card
                    key={plan.id}
                    className={`p-6 relative transition-all cursor-pointer ${
                      selectedPlan?.id === plan.id
                        ? 'border-amber-400 bg-amber-50'
                        : 'hover:border-slate-300'
                    }`}
                  >
                    {plan.badge && (
                      <Badge className="absolute top-4 right-4 bg-amber-500 text-slate-900">
                        {plan.badge}
                      </Badge>
                    )}

                    <div className="mb-6">
                      <Icon className="w-8 h-8 text-amber-500 mb-3" />
                      <h3 className="font-semibold text-slate-900 text-lg">{plan.name}</h3>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                        <span className="text-slate-600 ml-2">{plan.duration}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 shrink-0 mt-1" />
                          <span className="text-sm text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                    >
                      Select Plan
                    </Button>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-slate-50 rounded-lg text-xs text-slate-600 text-center">
              All payments are secure and handled by Stripe. A receipt will be sent to your email.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedPlan && (
        <PaymentGate
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          onPaid={handlePaymentSuccess}
          payerType="customer"
          contractorId={contractorId}
          contractorEmail={contractorEmail}
          contractorName={contractorName}
        />
      )}
    </>
  );
}