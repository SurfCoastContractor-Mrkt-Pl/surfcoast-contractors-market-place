import React, { useState } from 'react';
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
import { ArrowLeft, Briefcase, Loader2, CheckCircle } from 'lucide-react';
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

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Job.create(data),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl('Jobs'));
      }, 2000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      budget_min: formData.budget_min ? Number(formData.budget_min) : null,
      budget_max: formData.budget_max ? Number(formData.budget_max) : null,
    };
    mutation.mutate(data);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Posted!</h2>
          <p className="text-slate-600 mb-4">Your job has been posted successfully. Contractors will be able to see it now.</p>
          <p className="text-sm text-slate-500">Redirecting to jobs...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Jobs')} className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Post a Job</h1>
              <p className="text-slate-300">Find the right contractor for your project</p>
            </div>
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
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your project in detail..."
                  required
                  rows={5}
                  className="mt-1.5"
                />
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

          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
            disabled={mutation.isPending}
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