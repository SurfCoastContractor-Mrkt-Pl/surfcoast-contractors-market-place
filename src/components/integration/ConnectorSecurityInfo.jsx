import React from 'react';
import { AlertCircle, Lock, Users, Shield } from 'lucide-react';

export default function ConnectorSecurityInfo() {
  return (
    <div className="space-y-4">
      {/* Main Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">Shared Account Access</h3>
            <p className="text-sm text-amber-800">
              Connected OAuth accounts (like Google, Slack, etc.) are <strong>shared across your entire app</strong>. 
              Anyone with access to this app can use the connected account's data and permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Security Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What's Protected */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex gap-2 mb-2">
            <Lock className="w-5 h-5 text-green-600 flex-shrink-0" />
            <h4 className="font-semibold text-green-900">What's Protected</h4>
          </div>
          <ul className="text-sm text-green-800 space-y-1 ml-7">
            <li>✓ API keys never sent to browser</li>
            <li>✓ OAuth tokens server-side only</li>
            <li>✓ Secrets encrypted at rest</li>
          </ul>
        </div>

        {/* Who Can Access */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <h4 className="font-semibold text-blue-900">Shared Access</h4>
          </div>
          <ul className="text-sm text-blue-800 space-y-1 ml-7">
            <li>• All app users</li>
            <li>• All collaborators</li>
            <li>• Cannot restrict per-user</li>
          </ul>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex gap-2 mb-3">
          <Shield className="w-5 h-5 text-slate-600 flex-shrink-0" />
          <h4 className="font-semibold text-slate-900">Best Practices</h4>
        </div>
        <ul className="text-sm text-slate-700 space-y-2 ml-7 list-disc">
          <li>
            <strong>Only connect accounts everyone should access</strong> — Use a dedicated/shared Google account, 
            not personal accounts
          </li>
          <li>
            <strong>Limit connector scope</strong> — Request minimal permissions when connecting (read-only when possible)
          </li>
          <li>
            <strong>Audit access regularly</strong> — Review who has app access and what data they can see
          </li>
          <li>
            <strong>Use service accounts</strong> — For production apps, use Google/Slack service accounts instead of personal accounts
          </li>
          <li>
            <strong>Rotate credentials</strong> — If using API keys, rotate them periodically
          </li>
        </ul>
      </div>

      {/* Alternative: Per-User OAuth */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-2">Need Per-User Access?</h4>
        <p className="text-sm text-purple-800 mb-2">
          If you need each user to connect their own account (e.g., each user's own Google Calendar), 
          you'll need to build a custom OAuth flow using backend functions. Connectors don't support this pattern natively.
        </p>
        <p className="text-xs text-purple-700">
          Contact Base44 support for guidance on implementing custom per-user OAuth.
        </p>
      </div>
    </div>
  );
}