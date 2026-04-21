import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function LicenseStatusNotificationBanner({ licenseStatus }) {
  if (licenseStatus !== 'inactive') return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
      <div className="flex gap-2">
        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-yellow-800">License Status: Inactive</p>
          <p className="text-xs text-yellow-700 mt-1">
            This contractor's license is currently inactive. Please vet their qualifications and discuss licensing status before engaging.
          </p>
        </div>
      </div>
    </div>
  );
}