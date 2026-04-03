import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';

export default function OnboardingStep3Identity({
  formData,
  uploadingId,
  uploadingFace,
  onIdUpload,
  onFaceUpload,
  methods,
}) {
  const { formState: { errors } } = useFormContext();
  return (
    <div style={{ background:"rgba(10,22,40,0.55)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px", padding:"28px", marginBottom:"16px" }}>
      <h2 style={{ fontSize:"16px", fontWeight:"700", color:"#ffffff", marginBottom:"20px", paddingBottom:"12px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>Identity Verification</h2>
      
      <div className="p-5 rounded-xl border-2 border-blue-200 bg-blue-50 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900">Identity Verification Required</h3>
            <p className="text-sm text-blue-700 mt-1 leading-relaxed">
              Upload a valid government-issued photo ID or Driver's License, and a clear unobstructed photo of your face.
            </p>
          </div>
        </div>

        {/* ID Document Upload */}
        <div className="bg-white rounded-xl border border-blue-200 p-4 space-y-3">
          <Label className="font-semibold text-slate-800">Government-Issued ID / Driver's License *</Label>
          <p className="text-xs text-slate-500">Upload a clear photo of your ID. All four corners must be visible.</p>
          {errors.id_document_url && <p className="text-xs text-red-500">{errors.id_document_url.message}</p>}
          <div className="relative">
            {formData.id_document_url ? (
              <div className="relative group">
                <img src={formData.id_document_url} alt="ID Document" className="w-full max-h-48 object-contain rounded-lg border border-slate-200 bg-slate-50" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Click to replace</span>
                </div>
                <input type="file" accept="image/*" onChange={onIdUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                {uploadingId ? (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-blue-400 mb-2" />
                    <span className="text-sm text-blue-600 font-medium">Upload ID / Driver's License</span>
                    <span className="text-xs text-blue-400 mt-1">JPG, PNG accepted</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={onIdUpload} className="hidden" required={!formData.id_document_url} />
              </label>
            )}
          </div>
        </div>

        {/* Face Photo Upload */}
        <div className="bg-white rounded-xl border border-blue-200 p-4 space-y-3">
          <Label className="font-semibold text-slate-800">Clear Face Photo *</Label>
          <p className="text-xs text-slate-500">Upload an unobstructed photo of your face for identity verification.</p>
          {errors.face_photo_url && <p className="text-xs text-red-500">{errors.face_photo_url.message}</p>}
          <div className="relative">
            {formData.face_photo_url ? (
              <div className="relative group">
                <img src={formData.face_photo_url} alt="Face Photo" className="w-full max-h-48 object-contain rounded-lg border border-slate-200 bg-slate-50" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Click to replace</span>
                </div>
                <input type="file" accept="image/*" onChange={onFaceUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                {uploadingFace ? (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-blue-400 mb-2" />
                    <span className="text-sm text-blue-600 font-medium">Upload Face Photo</span>
                    <span className="text-xs text-blue-400 mt-1">JPG, PNG accepted</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={onFaceUpload} className="hidden" required={!formData.face_photo_url} />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}