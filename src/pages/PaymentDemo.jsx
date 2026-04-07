import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import PaymentButton from '@/components/payment/PaymentButton';

export default function PaymentDemo() {
  const [demoUser] = useState({
    email: 'demo@example.com',
    name: 'Demo User',
  });

  const [demoContractor] = useState({
    id: 'contractor-123',
    email: 'contractor@example.com',
    name: 'John Smith',
  });

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 48, paddingBottom: 48, paddingLeft: 16, paddingRight: 16, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 896, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.4rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>Payment Integration Demo</h1>
          <p style={{ fontSize: 18, color: T.muted, fontStyle: "italic" }}>
            Test all payment flows in a controlled environment
          </p>
        </div>

        {/* Info Alert */}
        <div style={{ marginBottom: 32, background: "#FBF5EC", border: "0.5px solid #D9B88A", borderRadius: 8, padding: 16, display: "flex", gap: 12 }}>
          <AlertCircle style={{ width: 16, height: 16, color: T.amber, flexShrink: 0, marginTop: 2 }} />
          <div style={{ color: T.amber, fontSize: 14, fontStyle: "italic" }}>
            <strong>Stripe Test Mode:</strong> Use test card 4242 4242 4242 4242 with any future expiry and CVC to simulate payments.
          </div>
        </div>

        {/* Payment Flows */}
        <Tabs defaultValue="quote" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="quote">Quote Request</TabsTrigger>
            <TabsTrigger value="timed">Timed Chat</TabsTrigger>
            <TabsTrigger value="custom">Custom Tier</TabsTrigger>
          </TabsList>

          {/* Quote Request Flow */}
          <TabsContent value="quote">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Quote Request Payment</h2>
              <p className="text-slate-600 mb-6">
                $1.75 one-time charge for unlimited communication without additional payment
              </p>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Payer Info</h3>
                    <p className="text-sm text-slate-600">Email: {demoUser.email}</p>
                    <p className="text-sm text-slate-600">Name: {demoUser.name}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Contractor Info</h3>
                    <p className="text-sm text-slate-600">Name: {demoContractor.name}</p>
                    <p className="text-sm text-slate-600">Email: {demoContractor.email}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <PaymentButton
                    payerEmail={demoUser.email}
                    payerName={demoUser.name}
                    payerType="customer"
                    contractorId={demoContractor.id}
                    contractorEmail={demoContractor.email}
                    contractorName={demoContractor.name}
                    tier="quote"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Timed Chat Flow */}
          <TabsContent value="timed">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Timed Communication</h2>
              <p className="text-slate-600 mb-6">
                $1.50 one-time charge for 10 minutes of direct messaging with contractor
              </p>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Payer Info</h3>
                    <p className="text-sm text-slate-600">Email: {demoUser.email}</p>
                    <p className="text-sm text-slate-600">Name: {demoUser.name}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Contractor Info</h3>
                    <p className="text-sm text-slate-600">Name: {demoContractor.name}</p>
                    <p className="text-sm text-slate-600">Email: {demoContractor.email}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <PaymentButton
                    payerEmail={demoUser.email}
                    payerName={demoUser.name}
                    payerType="customer"
                    contractorId={demoContractor.id}
                    contractorEmail={demoContractor.email}
                    contractorName={demoContractor.name}
                    tier="timed"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Custom Tier Flow */}
          <TabsContent value="custom">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Custom Payment Tier</h2>
              <p className="text-slate-600 mb-6">
                Test payment button with custom tier configuration
              </p>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Payer Info</h3>
                    <p className="text-sm text-slate-600">Email: {demoUser.email}</p>
                    <p className="text-sm text-slate-600">Name: {demoUser.name}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Contractor Info</h3>
                    <p className="text-sm text-slate-600">Name: {demoContractor.name}</p>
                    <p className="text-sm text-slate-600">Email: {demoContractor.email}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <PaymentButton
                    payerEmail={demoUser.email}
                    payerName={demoUser.name}
                    payerType="customer"
                    contractorId={demoContractor.id}
                    contractorEmail={demoContractor.email}
                    contractorName={demoContractor.name}
                    tier="quote"
                    label="Start Demo Payment"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Testing Notes */}
        <div style={{ marginTop: 32, background: T.card, border: "0.5px solid " + T.border, borderRadius: 10, boxShadow: T.shadow, padding: 24 }}>
          <h3 style={{ fontWeight: 700, color: T.dark, marginBottom: 12, fontStyle: "italic" }}>Testing Notes</h3>
          <ul style={{ fontSize: 14, color: T.muted, display: "flex", flexDirection: "column", gap: 8, fontStyle: "italic" }}>
            <li>• Click any button to initiate a test payment</li>
            <li>• You'll be redirected to Stripe checkout (test mode)</li>
            <li>• After payment, you'll see a success page with payment details</li>
            <li>• Check the database for Payment records created during checkout</li>
            <li>• Idempotency prevents duplicate checkouts if you refresh</li>
          </ul>
        </div>
      </div>
    </div>
  );
}