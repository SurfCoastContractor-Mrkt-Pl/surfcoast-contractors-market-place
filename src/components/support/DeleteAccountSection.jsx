import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DeleteAccountSection({ userEmail, displayName, onDelete }) {
  const [step, setStep] = useState(0); // 0=idle, 1=first confirm, 2=final warning

  const handleFirstConfirm = () => {
    setStep(0);
    setStep(2); // skip to final warning directly after first dialog
  };

  return (
    <>
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-start gap-3 mb-3">
          <Trash2 className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-red-800">Delete My Account</h2>
            <p className="text-sm text-red-700 mt-1">
              Permanently delete all your account data including your profile, signed disclaimers, payment records, and all activity. <strong>This cannot be undone.</strong>
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          className="bg-red-600 hover:bg-red-700"
          onClick={() => setStep(1)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete My Account
        </Button>
      </Card>

      {/* Step 1 — Did you mean to do this? */}
      <AlertDialog open={step === 1} onOpenChange={(open) => !open && setStep(0)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <AlertDialogTitle>Did you mean to delete your account?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              You clicked <strong>Delete My Account</strong>. This will permanently erase all data associated with <strong>{displayName || userEmail}</strong>, including your profile, history, payments, and agreements.
              <br /><br />
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStep(0)}>
              No, Keep My Account
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => setStep(2)}
            >
              Yes, I want to delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Step 2 — Final warning */}
      <AlertDialog open={step === 2} onOpenChange={(open) => !open && setStep(0)}>
        <AlertDialogContent className="border-2 border-red-300">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <AlertDialogTitle className="text-red-700">Final Warning — This Cannot Be Undone</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  ⚠️ You are about to <strong>permanently delete</strong> everything associated with <strong>{displayName || userEmail}</strong>. This includes:
                  <ul className="mt-2 ml-4 list-disc space-y-1 text-red-700">
                    <li>Your profile and all personal information</li>
                    <li>All signed disclaimers and agreements</li>
                    <li>Your payment history and records</li>
                    <li>All job history and activity</li>
                  </ul>
                </div>
                <p className="text-slate-600 text-sm">
                  This is your last chance to change your mind. Once deleted, there is no way to recover your data.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setStep(0)} className="border-green-400 text-green-700 hover:bg-green-50 sm:flex-1">
              ✋ Keep My Account
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-700 hover:bg-red-800 sm:flex-1"
              onClick={() => { setStep(0); onDelete(); }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Everything Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}