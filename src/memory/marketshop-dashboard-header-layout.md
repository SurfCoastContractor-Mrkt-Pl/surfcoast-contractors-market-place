# MarketShop Dashboard Header Layout

## Saved: 2026-03-21

### Header Structure (pages/MarketShopDashboard — lines ~125–165)

The shop header uses a two-row layout inside a flex column, where the "Upload Photo" button sits to the left and all text content stacks in a flex column to the right:

```jsx
<div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
  <div className="flex-1">
    {/* Row 1: Upload Photo + [Shop Name + Status + Location + Shop Type stacked] */}
    <div className="flex flex-row items-start gap-3">
      
      {/* LEFT: Upload Photo pill button */}
      <label className="cursor-pointer flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200 transition-colors flex-shrink-0">
        <Camera className="w-3.5 h-3.5" />
        <span>Upload Photo</span>
        <input type="file" accept="image/*" className="hidden" onChange={...} />
      </label>

      {/* RIGHT: Stacked flex-col */}
      <div className="flex flex-col">

        {/* Line 1: Shop Name + Status badge */}
        <div className="flex flex-row flex-wrap items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{shop.shop_name}</h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[status]}`}>
            {status}
          </span>
        </div>

        {/* Line 2: Location (city, STATE format) + Shop Type pill — naturally aligned under shop name */}
        <div className="flex flex-row flex-wrap items-center gap-2 mt-1">
          {(shop.city || shop.state) && (
            <span className="text-sm text-slate-500">
              {/* city capitalized normally, state uppercased */}
              {[shop.city, shop.state].filter(Boolean)
                .map((s, i) => i === 0 
                  ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() 
                  : s.toUpperCase()
                ).join(', ')}
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
  </div>
</div>
```

### Key Design Decisions
- "Upload Photo" is a pill-shaped label button (blue outline style) that sits to the LEFT of the shop name
- Shop name, status, location, and shop type all stack in a `flex-col` div to the RIGHT of the Upload Photo button
- This naturally aligns "Hemet, CA" (location) and the "Store icon Farmers Market" pill directly underneath the shop name — no magic pixel padding needed
- Location format: city = Title Case, state = UPPERCASE (e.g. "Hemet, CA")
- Shop type pill uses `Store` icon from lucide-react + text formatted with spaces and Title Case