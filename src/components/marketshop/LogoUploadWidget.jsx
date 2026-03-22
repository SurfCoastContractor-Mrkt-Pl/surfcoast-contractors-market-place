import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Loader2 } from 'lucide-react';

export default function LogoUploadWidget({ shop, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const logoInputRef = useRef(null);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const minSize = 50 * 1024; // 50KB
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size < minSize) {
      alert('Photo is too small. Please choose an image at least 50KB.');
      return;
    }
    if (file.size > maxSize) {
      alert('Photo is too large. Please choose an image smaller than 5MB.');
      return;
    }

    setUploading(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const { file_url } = response;
      if (!file_url) {
        alert('Upload failed: no URL returned');
        return;
      }
      await base44.entities.MarketShop.update(shop.id, { logo_url: file_url });
      onUpdate({ logo_url: file_url });
    } catch (err) {
      console.error('Logo upload error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const getInitials = () => {
    return shop.shop_name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join('');
  };

  const hasLogo = shop.logo_url && shop.logo_url.trim();

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Logo Display */}
      <div className="relative group">
        {hasLogo ? (
          <img
            src={shop.logo_url}
            alt={shop.shop_name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md"
          />
        ) : (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-white shadow-md">
            <span className="text-2xl sm:text-3xl font-bold text-white">{getInitials()}</span>
          </div>
        )}

        {/* Edit Icon Overlay */}
        <button
          type="button"
          onClick={() => logoInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full shadow-lg transition-colors opacity-0 group-hover:opacity-100"
          aria-label={hasLogo ? 'Change logo' : 'Upload logo'}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Upload Button */}
      <button
        type="button"
        onClick={() => logoInputRef.current?.click()}
        disabled={uploading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
          uploading
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : hasLogo
            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading...
          </>
        ) : hasLogo ? (
          <>
            <Camera className="w-4 h-4" />
            Change Logo
          </>
        ) : (
          <>
            <Camera className="w-4 h-4" />
            Upload Logo
          </>
        )}
      </button>

      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLogoUpload}
      />
    </div>
  );
}