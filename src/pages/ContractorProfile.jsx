import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, Star, MapPin, Clock, Phone, Mail, 
  CheckCircle2, DollarSign, ShieldAlert, AlertCircle, FileText
} from 'lucide-react';
import DisclaimerModal from '@/components/disclaimer/DisclaimerModal';
import ScopeOfWorkForm from '@/components/scopeofwork/ScopeOfWorkForm';
import PaymentGate from '@/components/payment/PaymentGate';
import InAppMessageForm from '@/components/messaging/InAppMessageForm';

const tradeLabels = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  carpenter: 'Carpenter',
  hvac: 'HVAC Technician',
  mason: 'Mason',
  roofer: 'Roofer',
  painter: 'Painter',
  welder: 'Welder',
  tiler: 'Tiler',
  landscaper: 'Landscaper',
  other: 'Other Trade'
};

export default function ContractorProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const contractorId = urlParams.get('id');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerSigned, setDisclaimerSigned] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [showScopeForm, setShowScopeForm] = useState(false);
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const [customerPaid, setCustomerPaid] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [showMessageForm, setShowMessageForm] = useState(false);

  const { data: contractor, isLoading } = useQuery({
    queryKey: ['contractor', contractorId],
    queryFn: async () => {
      const list = await base44.entities.Contractor.filter({ id: contractorId });
      return list[0];
    },
    enabled: !!contractorId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Contractor Not Found</h1>
          <Link to={createPageUrl('Contractors')}>
            <Button>Browse Contractors</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={createPageUrl('Contractors')} className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Contractors
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Profile Card */}
        <Card className="p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100">
                {contractor.photo_url ? (
                  <img src={contractor.photo_url} alt={contractor.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 text-white text-4xl font-bold">
                    {contractor.name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{contractor.name}</h1>
                    {contractor.available && (
                      <Badge className="bg-green-100 text-green-700">Available</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge 
                      variant="secondary" 
                      className={contractor.contractor_type === 'trade_specific' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-amber-100 text-amber-700'
                      }
                    >
                      {contractor.contractor_type === 'trade_specific' 
                        ? tradeLabels[contractor.trade_specialty] || 'Trade Specialist'
                        : 'General Contractor'
                      }
                    </Badge>
                  </div>

                  {contractor.rating && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            className={`w-5 h-5 ${star <= contractor.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{contractor.rating}</span>
                      {contractor.reviews_count && (
                        <span className="text-slate-500">({contractor.reviews_count} reviews)</span>
                      )}
                    </div>
                  )}
                </div>

                {contractor.hourly_rate && (
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Hourly Rate</div>
                    <div className="text-3xl font-bold text-slate-900">${contractor.hourly_rate}</div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {contractor.location}
                </div>
                {contractor.years_experience && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {contractor.years_experience} years experience
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8 pb-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            {contractor.bio && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">About</h2>
                <p className="text-slate-600 whitespace-pre-wrap">{contractor.bio}</p>
              </Card>
            )}

            {/* Certifications */}
            {contractor.certifications?.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Certifications & Licenses</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {contractor.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-medium text-slate-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Portfolio */}
            {contractor.portfolio_images?.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Portfolio</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {contractor.portfolio_images.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                      <img src={img} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact</h2>

              {/* Contact info hidden until fee paid */}
              {disclaimerSigned && customerPaid ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <ShieldAlert className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-xs text-green-700">
                      Disclaimer signed by <strong>{signerName}</strong> · Fee paid · Messaging unlocked
                    </p>
                  </div>
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
                    onClick={() => setShowMessageForm(true)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send In-App Message
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowScopeForm(true)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Request Scope of Work
                  </Button>
                </div>
              ) : disclaimerSigned && !customerPaid ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <ShieldAlert className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-xs text-green-700">Disclaimer signed by <strong>{signerName}</strong></p>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-xl text-sm text-slate-500 text-center">
                    🔒 Contact details hidden until fee is paid
                  </div>
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
                    onClick={() => setShowPaymentGate(true)}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Pay $1.50 to Unlock Messaging
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-100 rounded-xl text-sm text-slate-500 text-center">
                    🔒 Contact details hidden — sign disclaimer & pay fee to message
                  </div>
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
                    onClick={() => setShowDisclaimer(true)}
                  >
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    Sign Disclaimer & Contact
                  </Button>
                </div>
              )}
            </Card>

            {/* Disclaimer Notice */}
            <Card className="p-5 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">Required Notice</h4>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Before contacting this contractor, you must acknowledge that damages after work begins are your responsibility. 
                    You are required to vet all contractors independently before accepting any work.
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Info</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Type</span>
                  <span className="font-medium">{contractor.contractor_type === 'general' ? 'General' : 'Trade Specific'}</span>
                </div>
                {contractor.trade_specialty && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Specialty</span>
                    <span className="font-medium">{tradeLabels[contractor.trade_specialty]}</span>
                  </div>
                )}
                {contractor.years_experience && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Experience</span>
                    <span className="font-medium">{contractor.years_experience} years</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Availability</span>
                  <span className={`font-medium ${contractor.available ? 'text-green-600' : 'text-slate-500'}`}>
                    {contractor.available ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ScopeOfWorkForm
        open={showScopeForm}
        onClose={() => setShowScopeForm(false)}
        contractor={contractor}
      />

      <PaymentGate
        open={showPaymentGate}
        onClose={() => setShowPaymentGate(false)}
        onPaid={(record) => { setCustomerPaid(true); setPaymentRecord(record); setShowPaymentGate(false); }}
        payerType="customer"
        contractorId={contractor?.id}
        contractorEmail={contractor?.email}
        contractorName={contractor?.name}
      />

      <DisclaimerModal
        open={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        onAccepted={(record) => {
          setDisclaimerSigned(true);
          setSignerName(record.customer_name);
          setShowDisclaimer(false);
        }}
      />
    </div>
  );
}