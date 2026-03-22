import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Clock, AlertTriangle, FileCheck, Shield, DollarSign, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function LicenseVerificationDashboard({ contractor }) {
  const [expandedDoc, setExpandedDoc] = useState(null);

  if (!contractor) return null;

  const licenseStatus = {
    active: { color: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Active' },
    pending: { color: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
    expired: { color: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', icon: AlertTriangle, label: 'Expired' },
    unverified: { color: 'bg-slate-50 border-slate-200', badge: 'bg-slate-100 text-slate-600', icon: AlertCircle, label: 'Unverified' }
  };

  const DocumentCard = ({ title, document, docType, expiryDate, status }) => {
    const config = licenseStatus[status] || licenseStatus.unverified;
    const Icon = config.icon;

    return (
      <Card className={`p-4 border ${config.color}`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1">
            <FileCheck className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900">{title}</h4>
              <p className="text-xs text-slate-600 mt-1">{docType}</p>
            </div>
          </div>
          <Badge className={config.badge}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        {expiryDate && (
          <div className="text-xs text-slate-600 mb-3">
            {new Date(expiryDate) > new Date() 
              ? `Expires ${formatDistanceToNow(new Date(expiryDate), { addSuffix: true })}`
              : 'Expired'}
          </div>
        )}

        {document && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => window.open(document, '_blank')}
          >
            View Document
          </Button>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Verification Status Overview */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Credentials & Documentation</h3>
            <p className="text-sm text-slate-600">
              {contractor.license_verified ? '✓ License verified' : 'License verification pending'}
              {contractor.identity_verified ? ' • ✓ Identity verified' : ' • Identity not verified'}
            </p>
          </div>
          <Shield className="w-8 h-8 text-blue-600 flex-shrink-0" />
        </div>
      </Card>

      {/* License & Insurance Documents */}
      <Tabs defaultValue="license" className="space-y-4">
        <TabsList>
          <TabsTrigger value="license">License</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="bond">Bond</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
        </TabsList>

        {/* License Tab */}
        <TabsContent value="license" className="space-y-4">
          {contractor.is_licensed_sole_proprietor ? (
            <div className="space-y-4">
              <Card className="p-6 bg-green-50 border-green-200">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900">Licensed Sole Proprietor</h4>
                    <p className="text-sm text-green-800 mt-1">
                      License #{contractor.license_number} in {contractor.license_state}
                    </p>
                    {contractor.license_verified && (
                      <p className="text-xs text-green-700 mt-2">
                        ✓ Verified {contractor.license_verified_at ? formatDistanceToNow(new Date(contractor.license_verified_at), { addSuffix: true }) : 'recently'}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contractor.license_card_url && (
                  <DocumentCard
                    title="License Card"
                    document={contractor.license_card_url}
                    docType="Government-issued license card"
                    expiryDate={contractor.license_expiry}
                    status={contractor.license_status || 'active'}
                  />
                )}
                {contractor.license_certificate_url && (
                  <DocumentCard
                    title="License Certificate"
                    document={contractor.license_certificate_url}
                    docType="Official license certificate"
                    expiryDate={contractor.license_expiry}
                    status={contractor.license_status || 'active'}
                  />
                )}
                {contractor.business_license_url && (
                  <DocumentCard
                    title="Business License"
                    document={contractor.business_license_url}
                    docType="Business registration/license"
                    status={contractor.license_status || 'active'}
                  />
                )}
              </div>

              {/* HIS License if applicable */}
              {contractor.his_license_number && (
                <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
                  <div className="flex items-start gap-3">
                    <FileCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="font-semibold text-slate-900">Home Improvement Salesperson License</h5>
                      <p className="text-sm text-slate-600 mt-1">HIS #{contractor.his_license_number} in {contractor.his_license_state}</p>
                      {contractor.his_license_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => window.open(contractor.his_license_url, '_blank')}
                        >
                          View HIS License
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card className="p-6 text-center text-slate-500">
              <p>No license documentation on file. Add your license to increase credibility.</p>
            </Card>
          )}
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance">
          {contractor.insurance_policy_number ? (
            <Card className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-900">Insurance Policy</h4>
                  <p className="text-sm text-slate-600 mt-1">{contractor.insurance_company}</p>
                  <p className="text-xs text-slate-500 mt-2">Policy #{contractor.insurance_policy_number}</p>
                </div>
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-200">
                <div>
                  <p className="text-xs text-slate-600">Coverage Amount</p>
                  <p className="font-semibold text-slate-900">{contractor.insurance_coverage_amount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Expiry Date</p>
                  <p className="font-semibold text-slate-900">
                    {contractor.insurance_expiry ? new Date(contractor.insurance_expiry).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {contractor.insurance_document_url && (
                <Button
                  onClick={() => window.open(contractor.insurance_document_url, '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  View Insurance Document
                </Button>
              )}
            </Card>
          ) : (
            <Card className="p-6 text-center text-slate-500">
              <p>No insurance policy on file. Add your insurance to build customer trust.</p>
            </Card>
          )}
        </TabsContent>

        {/* Bond Tab */}
        <TabsContent value="bond">
          {contractor.bond_company ? (
            <Card className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-900">Surety Bond</h4>
                  <p className="text-sm text-slate-600 mt-1">{contractor.bond_company}</p>
                </div>
                <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-200">
                <div>
                  <p className="text-xs text-slate-600">Bond Amount</p>
                  <p className="font-semibold text-slate-900">{contractor.bond_amount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Expiry Date</p>
                  <p className="font-semibold text-slate-900">
                    {contractor.bond_expiry ? new Date(contractor.bond_expiry).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {contractor.bond_document_url && (
                <Button
                  onClick={() => window.open(contractor.bond_document_url, '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  View Bond Document
                </Button>
              )}
            </Card>
          ) : (
            <Card className="p-6 text-center text-slate-500">
              <p>No surety bond on file. Bonding increases customer confidence.</p>
            </Card>
          )}
        </TabsContent>

        {/* Credentials Tab */}
        <TabsContent value="credentials">
          {contractor.credential_documents && contractor.credential_documents.length > 0 ? (
            <div className="space-y-3">
              {contractor.credential_documents.map((cred, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h5 className="font-semibold text-slate-900">{cred.label}</h5>
                      <p className="text-xs text-slate-600 mt-1">Type: {cred.type}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Uploaded</Badge>
                  </div>
                  {cred.file_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => window.open(cred.file_url, '_blank')}
                    >
                      View Document
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-slate-500">
              <p>No additional credentials uploaded yet.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Verification Checklist */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Verification Checklist</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            {contractor.identity_verified ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={contractor.identity_verified ? 'text-slate-900 font-medium' : 'text-slate-700'}>
                Identity Verified
              </p>
              <p className="text-xs text-slate-600">
                {contractor.identity_verified ? '✓ Verified' : 'Pending verification'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            {contractor.license_verified ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={contractor.license_verified ? 'text-slate-900 font-medium' : 'text-slate-700'}>
                License Verified
              </p>
              <p className="text-xs text-slate-600">
                {contractor.license_verified ? '✓ Verified' : 'Not verified'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            {contractor.insurance_policy_number ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={contractor.insurance_policy_number ? 'text-slate-900 font-medium' : 'text-slate-700'}>
                Insurance on File
              </p>
              <p className="text-xs text-slate-600">
                {contractor.insurance_policy_number ? '✓ Active' : 'No policy'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}