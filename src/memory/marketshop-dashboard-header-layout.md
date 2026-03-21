# MarketShop Header Layout — Canonical Pattern

## Last Updated: 2026-03-21

---

## RULE: Background Images
- **MarketShopDashboard**: Fixed farmers market background image — DO NOT change or swap.
  `url(https://media.base44.com/images/public/69a61a047827463e7cdbc1eb/a3bd7c581_StockCake-Farmers_Market_Display-1240764-standard.jpg)`
- **MarketShopProfile**: Banner comes from `shop.banner_url` if set, else falls back to type-specific images — DO NOT change these fallbacks.

---

## PATTERN: Shop Name Header (applies to both Dashboard + Profile)

### Layout Rules
1. **Shop Name** on Line 1, with any badges (status / verified checkmark) inline beside it
2. **Location** (City, STATE format) + **Shop Type pill** on Line 2, naturally aligned below the shop name
3. No magic pixel padding — use flex-col structure so Line 2 left-aligns with Line 1

### Location Formatting
- City: Title Case (`s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()`)
- State: UPPERCASE (`.toUpperCase()`)
- Example: `"hemet"` + `"ca"` → `"Hemet, CA"`

---

## MarketShopDashboard — Header JSX (pages/MarketShopDashboard ~lines 128–162)

```jsx
{/* Row 1: Upload Photo + [Name + Status stacked with Location + Type] */}
<div className="flex flex-row items-start gap-3">

  {/* LEFT: Upload Photo pill (dashboard only) */}
  <label className="cursor-pointer flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200 transition-colors flex-shrink-0">
    <Camera className="w-3.5 h-3.5" />
    <span>Upload Photo</span>
    <input type="file" accept="image/*" className="hidden" onChange={...} />
  </label>

  {/* RIGHT: flex-col so lines 1 and 2 share the same left edge */}
  <div className="flex flex-col">

    {/* Line 1: Shop Name + Status badge */}
    <div className="flex flex-row flex-wrap items-center gap-2">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{shop.shop_name}</h1>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[status]}`}>
        {status}
      </span>
    </div>

    {/* Line 2: Location + Shop Type pill */}
    <div className="flex flex-row flex-wrap items-center gap-2 mt-1">
      {(shop.city || shop.state) && (
        <span className="text-sm text-slate-500">
          {[shop.city, shop.state].filter(Boolean)
            .map((s, i) => i === 0 ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s.toUpperCase())
            .join(', ')}
        </span>
      )}
      {shop.shop_type && (
        <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
          <Store className="w-3 h-3" />
          {shop.shop_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </span>
      )}
    </div>

  </div>
</div>
```

---

## MarketShopProfile — Header JSX (pages/MarketShopProfile ~lines 264–310)

```jsx
{/* Line 1: Shop Name + Verified badge */}
<div className="flex flex-row flex-wrap items-center gap-2 sm:gap-3 mb-1">
  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{shop.shop_name}</h1>
  {shop.verified_vendor && (
    <CheckCircle className="w-6 h-6 text-green-400" />
  )}
</div>

{/* Line 2: Location (MapPin icon + City, STATE) + Shop Type pill */}
<div className="flex flex-row flex-wrap items-center gap-2 mb-3">
  {(shop.city || shop.state) && (
    <span className="flex items-center gap-1 text-slate-300 text-sm">
      <MapPin className="w-4 h-4" />
      {[shop.city, shop.state].filter(Boolean)
        .map((s, i) => i === 0 ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s.toUpperCase())
        .join(', ')}
    </span>
  )}
  {TypeIcon && (
    <span className={`text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-2 ${typeColor.bg} ${typeColor.text}`}>
      <TypeIcon className="w-4 h-4" />
      The Market Booths
    </span>
  )}
</div>
```

---

## Key Design Decisions
- Location and shop type pill always sit on the SAME line (Line 2), together
- Location always formatted as "City, STATE" with proper case
- No absolute positioning or pixel padding — pure flexbox alignment
- Dashboard has "Upload Photo" button to the left of all text content
- Profile does not have upload button (read-only public view)
- Both pages keep their existing background images untouched