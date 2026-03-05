import React from 'react';
import { Card } from '@/components/ui/card';
import { Shield, Lock, CreditCard, Eye, Server, CheckCircle2 } from 'lucide-react';

const SecurityFeature = ({ icon: Icon, title, description, color = "green" }) => {
  const colors = {
    green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-200' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-200' },
  };
  const c = colors[color] || colors.green;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${c.bg} ${c.border}`}>
      <Icon className={`w-5 h-5 ${c.icon} mt-0.5 shrink-0`} />
      <div>
        <p className={`text-sm font-semibold ${c.icon.replace('text-', 'text-').replace('-600', '-800')}`}>{title}</p>
        <p className="text-xs text-slate-600 mt-0.5">{description}</p>
      </div>
    </div>
  );
};

export default function SecurityInfoPanel() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Privacy & Security</h3>
          <p className="text-xs text-slate-500">How we protect your account and data</p>
        </div>
      </div>

      <div className="space-y-3">
        <SecurityFeature
          icon={Lock}
          color="green"
          title="Data Encrypted at Rest"
          description="All your profile data, messages, and documents are stored using AES-256 encryption on our secure cloud servers."
        />
        <SecurityFeature
          icon={Server}
          color="green"
          title="Encrypted in Transit (HTTPS/TLS)"
          description="All communication between your device and our servers is protected with TLS 1.2+ encryption — the same standard used by banks."
        />
        <SecurityFeature
          icon={CreditCard}
          color="blue"
          title="PCI-DSS Compliant Payments (Stripe)"
          description="We never store your card numbers. Payment card data is handled exclusively by Stripe, a certified PCI Level 1 payment processor. We only retain the last 4 digits and card brand for display."
        />
        <SecurityFeature
          icon={Eye}
          color="blue"
          title="Identity Documents Protected"
          description="ID documents and face photos are stored in private, access-controlled storage. They are never publicly accessible and are only reviewed by verified admins."
        />
        <SecurityFeature
          icon={CheckCircle2}
          color="amber"
          title="Secure Authentication"
          description="Your login is managed by an industry-standard authentication system. Passwords are hashed and never stored in plain text."
        />
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          🔒 SurfCoast Contractors Market Place follows industry best practices for data security and privacy.
          <br />For concerns, contact us through the platform's suggestion form.
        </p>
      </div>
    </Card>
  );
}