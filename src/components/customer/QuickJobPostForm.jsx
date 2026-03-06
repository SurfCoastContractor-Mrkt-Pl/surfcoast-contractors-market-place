import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { logError } from '@/components/utils/logError';
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

export default function QuickJobPostForm({ userEmail, userName }) {
  const queryClient = useQueryClient();
  
  // Fallback for userName if not provided
  const displayName = userName || 'Customer';

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
    urgency: 'medium',
  });
  const [beforePhotos, setBeforePhotos] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Verify authenticated user and link job to their User account
      try {
        const user = await base44.auth.me();
        if (!user?.email) {
          throw new Error('You must be logged in to post a job');
        }
        
        // Ensure CustomerProfile exists and is linked to authenticated user
        const existing = await base44.entities.CustomerProfile.filter({ email: user.email });
        if (!existing || existing.length === 0) {
          await base44.entities.CustomerProfile.create({
            email: user.email,
            full_name: user.full_name || userName,
          });
        }
      } catch (err) {
        console.error('CustomerProfile verification failed:', err);
        throw err;
      }
      return base44.entities.Job.create(data);
    },
    onSuccess: () => {
      setSuccessMessage('Job posted successfully!');
      setFormData({
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
        urgency: 'medium',
      });
      setBeforePhotos([]);
      queryClient.invalidateQueries({ queryKey: ['customer-jobs'] });
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to post job');
      setTimeout(() => setErrorMessage(''), 3000);
    },
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (beforePhotos.length < 5) {
      setErrorMessage('Please upload at least 5 before photos.');
      return;
    }

    if (!formData.title || !formData.description || !formData.location) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if ((formData.budget_type === 'fixed' || formData.budget_type === 'hourly') && !formData.budget_min && !formData.budget_max) {
      setErrorMessage('Please provide at least a minimum or maximum budget.');
      return;
    }

    const data = {
      title: formData.title,
      description: formData.description,
      contractor_type_needed: formData.contractor_type_needed || 'either',
      trade_needed: formData.trade_needed || null,
      location: formData.location,
      budget_min: formData.budget_min ? Number(formData.budget_min) : null,
      budget_max: formData.budget_max ? Number(formData.budget_max) : null,
      budget_type: formData.budget_type,
      start_date: formData.start_date || null,
      duration: formData.duration || null,
      urgency: formData.urgency,
      status: 'open',
        poster_name: displayName,
        poster_email: userEmail,
      poster_phone: '',
      before_photo_urls: beforePhotos,
    };

    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Details</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Kitchen Renovation, Electrical Rewiring"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe what work needs to be done, any issues, and desired outcomes."
                rows={4}
                className="mt-1.5"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Contractor Type</Label>
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
                  placeholder="e.g., 2 weeks"
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

        <Card className="p-6 border-2 border-amber-200 bg-amber-50">
          <h3 className="font-semibold text-slate-900 mb-2">Before Photos <span className="text-red-500">*</span></h3>
          <p className="text-sm text-slate-600 mb-4">Upload at least 5 photos showing different angles of the work area.</p>
          <BeforePhotosUpload photos={beforePhotos} onChange={setBeforePhotos} />
        </Card>

        <Button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
          disabled={mutation.isPending || beforePhotos.length < 5}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            'Post Job'
          )}
        </Button>
      </form>
    </div>
  );
}