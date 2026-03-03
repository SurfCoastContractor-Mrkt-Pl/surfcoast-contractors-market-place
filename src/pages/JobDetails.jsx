import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { 
  ArrowLeft, MapPin, Calendar, DollarSign, Clock, 
  User, AlertCircle, ShieldAlert, MessageSquare
} from 'lucide-react';
import DisclaimerModal from '@/components/disclaimer/DisclaimerModal';
import PaymentGate from '@/components/payment/PaymentGate';
import InAppMessageForm from '@/components/messaging/InAppMessageForm';

const urgencyColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

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
  other: 'Other'
};

export default function JobDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerSigned, setDisclaimerSigned] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const [contractorPaid, setContractorPaid] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [showMessageForm, setShowMessageForm] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const list = await base44.entities.Job.filter({ id: jobId });
      return list[0];
    },
    enabled: !!jobId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Job Not Found</h1>
          <Link to={createPageUrl('Jobs')}>
            <Button>Browse Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatBudget = () => {
    if (!job.budget_min && !job.budget_max) return 'Negotiable';
    if (job.budget_min && job.budget_max) {
      return `$${job.budget_min.toLocaleString()} - $${job.budget_max.toLocaleString()}`;
    }
    if (job.budget_max) return `Up to $${job.budget_max.toLocaleString()}`;
    return `From $${job.budget_min.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={createPageUrl('Jobs')} className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                  <p className="text-slate-500">Posted by {job.poster_name}</p>
                </div>
                <Badge className={urgencyColors[job.urgency]} size="lg">
                  {job.urgency === 'urgent' ? '🔥 Urgent' : job.urgency}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="border-slate-300">
                  {job.contractor_type_needed === 'trade_specific' 
                    ? tradeLabels[job.trade_needed] || 'Trade Specific'
                    : job.contractor_type_needed === 'general' 
                      ? 'General Contractor'
                      : 'Any Contractor'
                  }
                </Badge>
                {job.status === 'open' && (
                  <Badge className="bg-green-100 text-green-700">Open</Badge>
                )}
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Job Description</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{job.description}</p>
              </div>
            </Card>

            {/* Details Grid */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Location</div>
                    <div className="font-medium text-slate-900">{job.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Budget ({job.budget_type || 'negotiable'})</div>
                    <div className="font-medium text-slate-900">{formatBudget()}</div>
                  </div>
                </div>

                {job.start_date && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Start Date</div>
                      <div className="font-medium text-slate-900">
                        {format(new Date(job.start_date), 'MMMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                )}

                {job.duration && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Duration</div>
                      <div className="font-medium text-slate-900">{job.duration}</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Posted by</div>
                    <div className="font-medium text-slate-900">{job.poster_name}</div>
                  </div>
                </div>

                {job.poster_email && (
                  <a 
                    href={`mailto:${job.poster_email}?subject=Interest in: ${job.title}`}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Email</div>
                      <div className="font-medium text-slate-900">{job.poster_email}</div>
                    </div>
                  </a>
                )}

                {job.poster_phone && (
                  <a 
                    href={`tel:${job.poster_phone}`}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Phone</div>
                      <div className="font-medium text-slate-900">{job.poster_phone}</div>
                    </div>
                  </a>
                )}
              </div>

              {disclaimerSigned ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <ShieldAlert className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-xs text-green-700">
                      Disclaimer signed by <strong>{signerName}</strong>
                    </p>
                  </div>
                  <a href={`mailto:${job.poster_email}?subject=Interest in: ${job.title}`}>
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
                      <Mail className="w-4 h-4 mr-2" />
                      Apply for this Job
                    </Button>
                  </a>
                </div>
              ) : (
                <Button
                  className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-slate-900"
                  onClick={() => setShowDisclaimer(true)}
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Sign Disclaimer & Apply
                </Button>
              )}
            </Card>

            {/* Disclaimer Notice */}
            <Card className="p-5 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">Important Notice</h4>
                  <p className="text-xs text-red-700 leading-relaxed">
                    You must read and sign the customer liability disclaimer before contacting a contractor. 
                    All damages after work commences are the customer's responsibility. 
                    It is your duty to vet all contractors prior to accepting any work.
                  </p>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Tips for Contractors</h4>
                  <p className="text-sm text-blue-700">
                    Include your relevant experience, certifications, and estimated timeline when reaching out.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

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