import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, CheckCircle2, XCircle, ScanFace, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function FaceScanVerification({ idDocumentUrl, onVerified, profilePhotoUrl, onProfilePhotoChange }) {
   const [uploadingPhoto, setUploadingPhoto] = useState(false);
   const [scanning, setScanning] = useState(false);
   const [result, setResult] = useState(null); // { match, confidence, reason, issues }
   const [localPhotoUrl, setLocalPhotoUrl] = useState(profilePhotoUrl || '');

   // Persist verification result to localStorage to survive refresh
   useEffect(() => {
     if (result?.match && result?.confidence !== 'low') {
       localStorage.setItem('faceVerificationResult', JSON.stringify(result));
     }
   }, [result]);

   // Load verification result from localStorage on mount
   useEffect(() => {
     const savedResult = localStorage.getItem('faceVerificationResult');
     if (savedResult) {
       const parsed = JSON.parse(savedResult);
       setResult(parsed);
       onVerified(true);
     }
   }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setResult(null);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setLocalPhotoUrl(file_url);
    onProfilePhotoChange(file_url);
    setUploadingPhoto(false);
  };

  const handleScan = async () => {
    if (!localPhotoUrl || !idDocumentUrl) return;
    setScanning(true);
    setResult(null);
    const response = await base44.functions.invoke('verifyFaceMatch', {
      profile_photo_url: localPhotoUrl,
      id_document_url: idDocumentUrl,
    });
    setResult(response.data);
    if (response.data?.match && response.data?.confidence !== 'low') {
      onVerified(true);
    } else {
      onVerified(false);
    }
    setScanning(false);
  };

  const isVerified = result?.match && result?.confidence !== 'low';
  const canScan = localPhotoUrl && idDocumentUrl && !scanning;

  return (
    <div className="space-y-4">
      {/* Profile Photo Upload */}
      <div className="bg-white rounded-xl border border-blue-200 p-4 space-y-3">
        <Label className="font-semibold text-slate-800 flex items-center gap-2">
          <ScanFace className="w-4 h-4 text-blue-600" />
          Profile Photo — Must Match Your ID *
        </Label>
        <p className="text-xs text-slate-500">
          Upload a clear, front-facing photo of yourself. This will be your public profile picture and must be verifiably the same person as on your uploaded ID/Driver's License. No sunglasses, hats, or masks.
        </p>

        <div className="relative">
          {localPhotoUrl ? (
            <div className="relative group w-36 mx-auto">
              <img src={localPhotoUrl} alt="Profile Photo" className="w-full aspect-square object-cover rounded-xl border-2 border-slate-200" />
              {isVerified && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <span className="text-white text-xs font-medium">Click to replace</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploadingPhoto}
              />
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
              {uploadingPhoto ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-blue-400 mb-2" />
                  <span className="text-sm text-blue-600 font-medium">Upload Profile Photo</span>
                  <span className="text-xs text-blue-400 mt-1">Clear, unobstructed face required</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {/* Scan Button */}
      {localPhotoUrl && idDocumentUrl && (
        <div className="space-y-3">
          {!result && (
            <Button
              type="button"
              onClick={handleScan}
              disabled={!canScan}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {scanning ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning & Comparing Faces...</>
              ) : (
                <><ScanFace className="w-4 h-4 mr-2" /> Run Face Verification Scan</>
              )}
            </Button>
          )}

          {/* Result */}
          {result && (
            <div className={`rounded-xl border p-4 space-y-2 ${isVerified ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
              <div className="flex items-center gap-2">
                {isVerified ? (
                  <><ShieldCheck className="w-5 h-5 text-green-600" /><span className="font-bold text-green-800">Face Verified — Match Confirmed</span></>
                ) : (
                  <><XCircle className="w-5 h-5 text-red-600" /><span className="font-bold text-red-800">Verification Failed — No Match</span></>
                )}
                <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${result.confidence === 'high' ? 'bg-green-200 text-green-800' : result.confidence === 'medium' ? 'bg-amber-200 text-amber-800' : 'bg-red-200 text-red-800'}`}>
                  {result.confidence} confidence
                </span>
              </div>
              <p className={`text-sm ${isVerified ? 'text-green-700' : 'text-red-700'}`}>{result.reason}</p>
              {result.issues?.length > 0 && (
                <ul className="space-y-1 mt-1">
                  {result.issues.map((issue, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-red-600">
                      <AlertTriangle className="w-3 h-3 shrink-0" /> {issue}
                    </li>
                  ))}
                </ul>
              )}
              {!isVerified && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                  onClick={() => { setResult(null); onVerified(false); }}
                >
                  Try Again with Different Photo
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {!idDocumentUrl && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Please upload your ID/Driver's License first before running face verification.
        </div>
      )}
    </div>
  );
}