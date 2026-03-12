import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Briefcase, CheckCircle2, Upload } from 'lucide-react';
import BeforePhotosUpload from '@/components/photos/BeforePhotosUpload';

const trades = [
  'Electrician', 'Plumber', 'Carpenter', 'HVAC', 'Mason',
  'Roofer', 'Painter', 'Welder', 'Landscaper', 'Other'
];

export default function QuickJobPost() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [beforePhotos, setBeforePhotos] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trade_needed: '',
    location: '',
    poster_name: '',
    poster_email: '',
    poster_phone: '',
    urgency: 'medium',
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          base44.auth.redirectToLogin(window.location.pathname);
        } else {
          setFormData(prev => ({
            ...prev,
            poster_email: user.email,
            poster_name: user.full_name || '',
          }));
        }
      } catch {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    checkAuth();
  }, []);

  const handleNext = () => {
    if (step === 1 && !formData.title.trim()) {
      alert('Please enter a job title');
      return;
    }
    if (step === 2 && !formData.description.trim()) {
      alert('Please describe the work needed');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (beforePhotos.length < 3) {
      alert('Please upload at least 3 photos');
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();
      const jobData = {
        ...formData,
        before_photo_urls: beforePhotos,
        status: 'open',
      };
      await base44.entities.Job.create(jobData);
      setSuccess(true);
      setTimeout(() => navigate(createPageUrl('MyJobs')), 2000);
    } catch (error) {
      alert('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-12 text-center bg-white shadow-2xl border-2 border-green-500">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Job Posted!</h2>
            <p className="text-slate-600 mb-4">Contractors can now respond to your job.</p>
            <p className="text-sm text-slate-400">Redirecting...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 mb-8"
          onClick={() => navigate(createPageUrl('Home'))}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    s <= step
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-amber-500' : 'bg-slate-700'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>Job Details</span>
            <span>Description</span>
            <span>Photos</span>
          </div>
        </div>

        <Card className="p-8 bg-white">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  What needs to be done? *
                </label>
                <Input
                  placeholder="e.g., Kitchen renovation, Fix leaky faucet"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Type of Work
                </label>
                <select
                  value={formData.trade_needed}
                  onChange={(e) => setFormData({ ...formData, trade_needed: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select trade...</option>
                  {trades.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Where is the work? *
                </label>
                <Input
                  placeholder="City, State"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  How urgent?
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="low">Low - Flexible timeline</option>
                  <option value="medium">Medium - Within a month</option>
                  <option value="high">High - Within 2 weeks</option>
                  <option value="urgent">Urgent - ASAP</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Describe the work in detail *
                </label>
                <Textarea
                  placeholder="Include: what needs to be done, any issues you've noticed, what's visible in the photos, desired outcome"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="text-base"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Your Name *
                  </label>
                  <Input
                    value={formData.poster_name}
                    onChange={(e) => setFormData({ ...formData, poster_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Phone (Optional)
                  </label>
                  <Input
                    value={formData.poster_phone}
                    onChange={(e) => setFormData({ ...formData, poster_phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Add Photos *</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Upload 3+ photos showing the work area from different angles. This helps contractors
                  understand the scope.
                </p>
                <BeforePhotosUpload photos={beforePhotos} onChange={setBeforePhotos} />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={handleNext} className="flex-1 bg-amber-500 hover:bg-amber-600">
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Posting...' : 'Post Job'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}