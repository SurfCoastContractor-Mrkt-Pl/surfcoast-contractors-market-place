import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export default function InvoiceCustomizationManager({ contractorEmail, tierLevel }) {
  const [customization, setCustomization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

  useEffect(() => {
    fetchCustomization();
  }, [contractorEmail]);

  const fetchCustomization = async () => {
    try {
      const data = await base44.entities.InvoiceCustomization.filter({ 
        contractor_email: contractorEmail 
      });
      if (data && data.length > 0) {
        setCustomization(data[0]);
        if (data[0].company_logo_url) setLogoPreview(data[0].company_logo_url);
        if (data[0].signature_url) setSignaturePreview(data[0].signature_url);
      } else {
        // Create default customization
        const newCustomization = {
          contractor_email: contractorEmail,
          tier: tierLevel,
        };
        await base44.entities.InvoiceCustomization.create(newCustomization);
        setCustomization(newCustomization);
      }
    } catch (error) {
      console.error('Error fetching customization:', error);
      setMessage({ type: 'error', text: 'Failed to load customization settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setCustomization({ ...customization, company_logo_url: result.file_url });
      setLogoPreview(result.file_url);
      setMessage({ type: 'success', text: 'Logo uploaded successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload logo' });
    }
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setCustomization({ ...customization, signature_url: result.file_url });
      setSignaturePreview(result.file_url);
      setMessage({ type: 'success', text: 'Signature uploaded successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload signature' });
    }
  };

  const handleSave = async () => {
    if (!customization || !customization.id) return;
    
    setSaving(true);
    try {
      await base44.entities.InvoiceCustomization.update(customization.id, customization);
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const isFeatureAvailable = (feature) => {
    const tierAccess = {
      logo: tierLevel !== 'starter',
      paymentTerms: tierLevel !== 'starter',
      customNotes: tierLevel !== 'starter' && tierLevel !== 'pro',
      templateColors: tierLevel === 'rider',
      digitalSignature: tierLevel === 'rider',
      autoSend: tierLevel === 'rider',
    };
    return tierAccess[feature];
  };

  const FeatureLock = ({ feature, children }) => {
    if (isFeatureAvailable(feature)) return children;
    
    const tierRequired = {
      logo: 'Wave Pro',
      paymentTerms: 'Wave Pro',
      customNotes: 'Wave Max',
      templateColors: 'Wave Rider',
      digitalSignature: 'Wave Rider',
      autoSend: 'Wave Rider',
    };

    return (
      <div className="relative opacity-50 pointer-events-none">
        {children}
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded">
          <Lock className="w-5 h-5 text-slate-500" />
        </div>
        <p className="text-xs text-slate-500 mt-1">Requires {tierRequired[feature]}</p>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`flex items-start gap-3 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800' 
            : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Logo Section - Pro+ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Company Logo
            {!isFeatureAvailable('logo') && <Lock className="w-4 h-4 text-slate-400" />}
          </CardTitle>
          <CardDescription>Add your company logo to invoices (Wave Pro+)</CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureLock feature="logo">
            <div className="space-y-4">
              {logoPreview && (
                <div className="border rounded-lg p-4 bg-slate-50">
                  <img src={logoPreview} alt="Logo preview" className="max-h-20" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-100 hover:file:bg-slate-200"
              />
            </div>
          </FeatureLock>
        </CardContent>
      </Card>

      {/* Payment Terms Section - Pro+ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Payment Terms
            {!isFeatureAvailable('paymentTerms') && <Lock className="w-4 h-4 text-slate-400" />}
          </CardTitle>
          <CardDescription>Specify payment terms for your invoices (Wave Pro+)</CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureLock feature="paymentTerms">
            <div className="space-y-4">
              <Select value={customization?.payment_terms || ''} onValueChange={(value) => 
                setCustomization({ ...customization, payment_terms: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                  <SelectItem value="net_15">Net 15</SelectItem>
                  <SelectItem value="net_30">Net 30</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              {customization?.payment_terms === 'custom' && (
                <Input
                  placeholder="Enter custom payment terms (e.g., '50% deposit, 50% on completion')"
                  value={customization?.custom_payment_terms_text || ''}
                  onChange={(e) => setCustomization({ ...customization, custom_payment_terms_text: e.target.value })}
                />
              )}
            </div>
          </FeatureLock>
        </CardContent>
      </Card>

      {/* Custom Notes Section - Max+ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Invoice Notes
            {!isFeatureAvailable('customNotes') && <Lock className="w-4 h-4 text-slate-400" />}
          </CardTitle>
          <CardDescription>Add custom notes to all your invoices (Wave Max+)</CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureLock feature="customNotes">
            <Textarea
              placeholder="Enter notes to appear on your invoices (e.g., thank you message, warranty info, etc.)"
              value={customization?.invoice_notes || ''}
              onChange={(e) => setCustomization({ ...customization, invoice_notes: e.target.value })}
              rows={4}
            />
          </FeatureLock>
        </CardContent>
      </Card>

      {/* Template Colors Section - Rider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Template Colors
            {!isFeatureAvailable('templateColors') && <Lock className="w-4 h-4 text-slate-400" />}
          </CardTitle>
          <CardDescription>Customize invoice template colors (Wave Rider)</CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureLock feature="templateColors">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Header Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customization?.template_colors?.header_color || '#333333'}
                    onChange={(e) => setCustomization({
                      ...customization,
                      template_colors: { ...customization?.template_colors, header_color: e.target.value }
                    })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={customization?.template_colors?.header_color || '#333333'}
                    onChange={(e) => setCustomization({
                      ...customization,
                      template_colors: { ...customization?.template_colors, header_color: e.target.value }
                    })}
                    placeholder="#333333"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customization?.template_colors?.accent_color || '#f0f0f0'}
                    onChange={(e) => setCustomization({
                      ...customization,
                      template_colors: { ...customization?.template_colors, accent_color: e.target.value }
                    })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={customization?.template_colors?.accent_color || '#f0f0f0'}
                    onChange={(e) => setCustomization({
                      ...customization,
                      template_colors: { ...customization?.template_colors, accent_color: e.target.value }
                    })}
                    placeholder="#f0f0f0"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customization?.template_colors?.text_color || '#333333'}
                    onChange={(e) => setCustomization({
                      ...customization,
                      template_colors: { ...customization?.template_colors, text_color: e.target.value }
                    })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={customization?.template_colors?.text_color || '#333333'}
                    onChange={(e) => setCustomization({
                      ...customization,
                      template_colors: { ...customization?.template_colors, text_color: e.target.value }
                    })}
                    placeholder="#333333"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </FeatureLock>
        </CardContent>
      </Card>

      {/* Digital Signature Section - Rider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Digital Signature
            {!isFeatureAvailable('digitalSignature') && <Lock className="w-4 h-4 text-slate-400" />}
          </CardTitle>
          <CardDescription>Add your digital signature to invoices (Wave Rider)</CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureLock feature="digitalSignature">
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={customization?.digital_signature_enabled || false}
                  onChange={(e) => setCustomization({ ...customization, digital_signature_enabled: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Enable digital signature on invoices</span>
              </label>

              {customization?.digital_signature_enabled && (
                <>
                  {signaturePreview && (
                    <div className="border rounded-lg p-4 bg-slate-50">
                      <img src={signaturePreview} alt="Signature preview" className="max-h-16" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-100 hover:file:bg-slate-200"
                  />
                  <p className="text-xs text-slate-500">Upload a PNG or JPG signature image</p>
                </>
              )}
            </div>
          </FeatureLock>
        </CardContent>
      </Card>

      {/* Auto-Send Section - Rider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Automated Invoice Delivery
            {!isFeatureAvailable('autoSend') && <Lock className="w-4 h-4 text-slate-400" />}
          </CardTitle>
          <CardDescription>Automatically send invoices after job completion (Wave Rider)</CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureLock feature="autoSend">
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={customization?.auto_send_enabled || false}
                  onChange={(e) => setCustomization({ ...customization, auto_send_enabled: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Enable automatic invoice sending</span>
              </label>

              {customization?.auto_send_enabled && (
                <div>
                  <label className="block text-sm font-medium mb-2">Days to wait before auto-sending</label>
                  <Input
                    type="number"
                    min="0"
                    max="30"
                    value={customization?.auto_send_delay_days || 0}
                    onChange={(e) => setCustomization({ ...customization, auto_send_delay_days: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-slate-500 mt-1">Invoices will be automatically sent this many days after job completion</p>
                </div>
              )}
            </div>
          </FeatureLock>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Invoice Customization'}
      </Button>
    </div>
  );
}