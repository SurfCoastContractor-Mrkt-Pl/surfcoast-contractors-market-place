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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Payment Integration Demo</h1>
          <p className="text-lg text-slate-600">
            Test all payment flows in a controlled environment
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 ml-2">
            <strong>Stripe Test Mode:</strong> Use test card 4242 4242 4242 4242 with any future expiry and CVC to simulate payments.
          </AlertDescription>
        </Alert>

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
        <Card className="mt-8 p-6 bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-amber-900 mb-3">Testing Notes</h3>
          <ul className="text-sm text-amber-800 space-y-2">
            <li>• Click any button to initiate a test payment</li>
            <li>• You'll be redirected to Stripe checkout (test mode)</li>
            <li>• After payment, you'll see a success page with payment details</li>
            <li>• Check the database for Payment records created during checkout</li>
            <li>• Idempotency prevents duplicate checkouts if you refresh</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}