import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Briefcase, Loader2, CheckCircle, Users, ArrowRight } from 'lucide-react';
import BeforePhotosUpload from '@/components/photos/BeforePhotosUpload';

const trades = [
  { id: 'electrician', name: 'Electrician' },
  { id: 'plumber', name: 'Plumber' },
  { id: 'carpenter', name: 'Carpenter' },
  { id: 'hvac', name: 'HVAC Technician' },
  { id: 'mason', name: 'Mason' },
  { id: 'roofer', name: 'Roofer' },
  { id: 'painter', name: 'Painter' },
  { id: 'welder', name: 'Welder' },
  { id: 'tiler', name: 'Tiler' },
  { id: 'landscaper', name: 'Landscaper' },
  { id: 'other', name: 'Other' },
];

export default function PostJob() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [isContractor, setIsContractor] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contractor_type_needed: '',
    trade_needed: '',
    location: '',
    budget_min: '',
    budget_max: '',
    budget_type: 'negotiable',
    start_date: '',
    duration: '',
    poster_name: '',
    poster_email: '',
    poster_phone: '',
    urgency: 'medium',
    status: 'open'
  });
  const [beforePhotos, setBeforePhotos] = useState([]);

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }
        const contractors = await base44.entities.Contractor.filter({ email: user.email });
        if (contractors && contractors.length > 0) {
          setIsContractor(true);
        } else {
          setIsContractor(false);
        }
      } catch {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    checkUserType();
  }, []);

  if (isContractor === true) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Customers Only</h2>
          <p className="text-slate-600 mb-6">Only customers can post jobs. If you're a contractor, you can browse and respond to job postings instead.</p>
          <Button onClick={() => navigate(createPageUrl('Jobs'))} className="bg-amber-500 hover:bg-amber-600">
            Browse Jobs for Contractors
          </Button>
        </Card>
      </div>
    );
  }

  if (isContractor === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Ensure CustomerProfile exists before creating job
      try {
        const user = await base44.auth.me();
        if (user) {
          const existing = await base44.entities.CustomerProfile.filter({ email: user.email });
          if (!existing || existing.length === 0) {
            await base44.entities.CustomerProfile.create({
              email: user.email,
              full_name: user.full_name || data.poster_name,
              phone: data.poster_phone || ''
            });
          }
        }
      } catch (err) {
        console.error('CustomerProfile creation failed:', err);
      }
      return base44.entities.Job.create(data);
    },
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (beforePhotos.length < 5) {
      alert('Please upload at least 5 before photos of the work area before submitting.');
      return;
    }
    if (formData.budget_type === 'fixed' || formData.budget_type === 'hourly') {
      if (!formData.budget_min && !formData.budget_max) {
        alert('Please provide at least a minimum or maximum budget.');
        return;
      }
    }
    // Validate email
    if (!formData.poster_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.poster_email)) {
      alert('Please provide a valid email address.');
      return;
    }
    const data = {
      ...formData,
      budget_min: formData.budget_min ? Number(formData.budget_min) : null,
      budget_max: formData.budget_max ? Number(formData.budget_max) : null,
      before_photo_urls: beforePhotos,
    };
    mutation.mutate(data);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  if (success) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-8 bg-white shadow-2xl border-2 border-green-500">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <button
                onClick={() => setSuccess(false)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Posted Successfully! ✓</h2>
            <p className="text-sm text-slate-700 mb-1">Your job has been successfully posted.</p>
            <p className="text-sm text-slate-600 mb-6">Contractors can now see and respond to your job posting.</p>
            <Button
              onClick={() => navigate(createPageUrl('MyJobs'))}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              View My Jobs <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="relative py-14 text-white overflow-hidden" style={{backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/9f9e7efe6_Capture.PNG)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0" style={{backgroundColor: 'rgba(0,0,0,0.58)'}}></div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-5">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-4">
            <div className="rounded-xl flex items-center justify-center p-3" style={{backgroundColor: '#1E5A96'}}>
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Post as Customer</h1>
              <p className="text-white/75 mt-1">Post a job and find the right contractor for your project</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-white/20">
            <div className="flex items-center gap-2 text-white/80 text-sm"><CheckCircle className="w-4 h-4 text-green-400" /> Free to post</div>
            <div className="flex items-center gap-2 text-white/80 text-sm"><CheckCircle className="w-4 h-4 text-green-400" /> Contractors reach out to you</div>
            <div className="flex items-center gap-2 text-white/80 text-sm"><CheckCircle className="w-4 h-4 text-green-400" /> All professionals verified</div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
           <Card className="p-6 md:p-8 mb-6">
             <h2 className="text-lg font-semibold text-slate-900 mb-6">Job Details</h2>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Kitchen Renovation, Electrical Rewiring"
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="description">Detailed Description of the Work *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe the job in detail. Include: What work needs to be done, specific issues you've noticed, what's visible in the photos, any damage or problem areas, desired outcome, and any materials or preferences you have."
                  required
                  rows={6}
                  className="mt-1.5"
                />
                <p className="text-xs text-slate-500 mt-2">The more detail you provide, the better contractors can assess the job and provide accurate quotes.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Contractor Type Needed</Label>
                  <Select value={formData.contractor_type_needed} onValueChange={(v) => handleChange('contractor_type_needed', v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trade_specific">Trade Specific</SelectItem>
                      <SelectItem value="general">General Contractor</SelectItem>
                      <SelectItem value="either">Either</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.contractor_type_needed === 'trade_specific' && (
                  <div>
                    <Label>Trade Specialty</Label>
                    <Select value={formData.trade_needed} onValueChange={(v) => handleChange('trade_needed', v)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select trade" />
                      </SelectTrigger>
                      <SelectContent>
                        {trades.map(trade => (
                          <SelectItem key={trade.id} value={trade.id}>{trade.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="City, State"
                  required
                  className="mt-1.5"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="budget_min">Budget Min ($)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => handleChange('budget_min', e.target.value)}
                    placeholder="0"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="budget_max">Budget Max ($)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => handleChange('budget_max', e.target.value)}
                    placeholder="0"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Budget Type</Label>
                  <Select value={formData.budget_type} onValueChange={(v) => handleChange('budget_type', v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="negotiable">Negotiable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Expected Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Estimated Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    placeholder="e.g., 2 weeks, 1 month"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label>Urgency Level</Label>
                <Select value={formData.urgency} onValueChange={(v) => handleChange('urgency', v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Flexible timeline</SelectItem>
                    <SelectItem value="medium">Medium - Within a month</SelectItem>
                    <SelectItem value="high">High - Within 2 weeks</SelectItem>
                    <SelectItem value="urgent">🔥 Urgent - ASAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6 md:p-8 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Your Contact Info</h2>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="poster_name">Your Name *</Label>
                <Input
                  id="poster_name"
                  value={formData.poster_name}
                  onChange={(e) => handleChange('poster_name', e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="poster_email">Email *</Label>
                  <Input
                    id="poster_email"
                    type="email"
                    value={formData.poster_email}
                    onChange={(e) => handleChange('poster_email', e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="poster_phone">Phone</Label>
                  <Input
                    id="poster_phone"
                    type="tel"
                    value={formData.poster_phone}
                    onChange={(e) => handleChange('poster_phone', e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 md:p-8 mb-6 border-2 border-amber-200 bg-amber-50">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Before Photos <span className="text-red-500">*</span></h2>
            <p className="text-sm text-slate-600 mb-4 font-medium">Show contractors exactly what they're working with</p>
            <p className="text-sm text-slate-600 mb-4">
              Upload at least 5 photos showing different angles and areas of the work space. Include:
              <ul className="mt-2 ml-4 space-y-1 text-slate-600">
                <li>• Overview shots of the entire area</li>
                <li>• Close-ups of problem areas or damage</li>
                <li>• Different angles and lighting conditions</li>
                <li>• Any specific issues you want contractors to see</li>
              </ul>
            </p>
            <BeforePhotosUpload photos={beforePhotos} onChange={setBeforePhotos} />
          </Card>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full text-white font-semibold"
            style={{backgroundColor: '#1E5A96'}}
            disabled={mutation.isPending || beforePhotos.length < 5}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Job'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}