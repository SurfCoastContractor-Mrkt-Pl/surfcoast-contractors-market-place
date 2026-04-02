import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';

export default function LicenseVerificationWidget({ contractorId }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    licenseNumber: '',
    state: '',
    licenseType: 'contractor',
  });

  const handleVerify = async () => {
    setLoading(true);
    try {
      const verification = await base44.functions.invoke('verifyLicenseAndInsurance', {
        contractorId,
        ...formData,
      });
      setResult(verification);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900">License & Insurance Verification</h3>
      </div>

      {!result ? (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="License Number"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <select
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Select State</option>
            <option value="CA">California</option>
            <option value="TX">Texas</option>
            <option value="FL">Florida</option>
            <option value="NY">New York</option>
          </select>
          <button
            onClick={handleVerify}
            disabled={loading || !formData.licenseNumber || !formData.state}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify License'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {result.verified ? (
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">License Verified</p>
                <p className="text-sm text-green-700">{result.verification.verification_notes}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Verification Failed</p>
                <p className="text-sm text-red-700">{result.verification.verification_notes}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setResult(null)}
            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}