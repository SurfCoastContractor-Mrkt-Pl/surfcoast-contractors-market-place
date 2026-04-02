import { useState, useEffect } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Hoisted outside component — never recreated on re-render
const CATEGORIES = [
  { id: "contractors", label: "Contractors", icon: "🔧", bold: true },
  { id: "market-booths", label: "Market Booths", icon: "🏪", bold: true },
  { id: "farmers-markets", label: "Farmers Markets", icon: "🌾", bold: true },
  { id: "vendors", label: "Vendors", icon: "🛍️", bold: true },
  { id: "swapmeets", label: "SwapMeets", icon: "🏬", bold: true }
];

export default function ContractorLocationSearch() {
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchType, setSearchType] = useState("contractors");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location.trim()) return;

    setIsLoading(true);
    setSearched(true);

    try {
      let searchResults = [];

      const loc = location.trim().toLowerCase();
      if (searchType === "contractors") {
        const all = await base44.entities.Contractor.filter({ available: true });
        searchResults = (all || []).filter(c =>
          c.location?.toLowerCase().includes(loc)
        );
      } else if (searchType === "market-booths" || searchType === "vendors") {
        const all = await base44.entities.MarketShop.filter({ is_active: true });
        searchResults = (all || []).filter(s =>
          s.city?.toLowerCase().includes(loc) ||
          s.state?.toLowerCase().includes(loc) ||
          s.zip?.includes(loc)
        );
      } else if (searchType === "farmers-markets") {
        const all = await base44.entities.MarketShop.filter({ is_active: true, shop_type: "farmers_market" });
        searchResults = (all || []).filter(s =>
          s.city?.toLowerCase().includes(loc) ||
          s.state?.toLowerCase().includes(loc) ||
          s.zip?.includes(loc)
        );
      } else if (searchType === "swapmeets") {
        const all = await base44.entities.MarketShop.filter({ is_active: true, shop_type: "swap_meet" });
        searchResults = (all || []).filter(s =>
          s.city?.toLowerCase().includes(loc) ||
          s.state?.toLowerCase().includes(loc) ||
          s.zip?.includes(loc)
        );
      }

      setResults(searchResults || []);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "900px", marginBottom: "32px" }}>
      <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "24px 20px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <MapPin size={20} style={{ color: "#ea580c" }} />
          Search Near You
        </h3>

        {/* Category Selector */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSearchType(cat.id)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: searchType === cat.id ? "1px solid #ea580c" : "1px solid #d1d5db",
                background: searchType === cat.id ? "#fed7aa" : "transparent",
                color: searchType === cat.id ? "#92400e" : "#1f2937",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => {
                if (searchType !== cat.id) {
                  e.currentTarget.style.borderColor = "#ea580c";
                  e.currentTarget.style.color = "#1f2937";
                }
              }}
              onMouseLeave={(e) => {
                if (searchType !== cat.id) {
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.color = "#6b7280";
                }
              }}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <label htmlFor="location-search" style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", border: 0 }}>Search by city, zip code, or region</label>
            <input
              id="location-search"
              type="text"
              placeholder="Search by city, zip code, or region..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "#f9fafb",
                color: "#1f2937",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
                minHeight: "44px"
              }}
              onFocus={(e) => e.target.style.borderColor = "#ea580c"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#ea580c",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "700",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {!isLoading && "Search"}
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#1f2937", margin: "0", fontWeight: "600" }}>Search by location to find verified professionals in your area</p>
        </form>

        {/* Results */}
        {searched && (
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Loader2 size={24} className="animate-spin" style={{ color: "#ea580c", margin: "0 auto" }} />
              </div>
            ) : results.length > 0 ? (
              <div>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "12px" }}>
                  Found {results.length} {searchType === "contractors" ? "contractor" : searchType === "market-booths" ? "market booth" : searchType === "farmers-markets" ? "farmers market" : searchType === "vendors" ? "vendor" : "swapmeet"}{results.length !== 1 ? "s" : ""}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                   {results.slice(0, 6).map((result) => (
                     <div
                        key={result.id}
                        onClick={() => {
                          if (searchType === "contractors") {
                            window.location.href = `/contractor/${result.id}`;
                          } else {
                            window.location.href = `/vendor/${result.id}`;
                          }
                        }}
                        style={{
                          padding: "14px 12px",
                          background: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#f9fafb";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {result.name || result.shop_name}
                        </p>
                        {searchType === "contractors" && result.line_of_work && (
                          <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {result.line_of_work.replace(/_/g, " ")}
                          </p>
                        )}
                        <p style={{ margin: "0", fontSize: "12px", color: "#ea580c", fontWeight: "600" }}>
                          {result.location || (result.city && result.state ? `${result.city}, ${result.state}` : result.city || '')}
                        </p>
                        {result.rating && (
                          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#9ca3af" }}>
                            ⭐ {result.rating.toFixed(1)} ({result.reviews_count || 0})
                          </p>
                        )}
                      </div>
                   ))}
                </div>
                {results.length > 6 && (
                  <button
                    onClick={() => {
                      if (searchType === "contractors") {
                        window.location.href = '/FindContractors';
                      } else {
                        window.location.href = '/BoothsAndVendorsMap';
                      }
                    }}
                    style={{
                      width: "100%",
                      marginTop: "16px",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "1px solid #ea580c",
                      background: "transparent",
                      color: "#ea580c",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#fff7ed";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    View all results →
                  </button>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: "0" }}>
                  No {searchType === "contractors" ? "contractors" : searchType === "market-booths" ? "market booths" : searchType === "farmers-markets" ? "farmers markets" : searchType === "vendors" ? "vendors" : "swapmeets"} found in "{location}". Try a different location.
                </p>
              </div>
            )}
          </div>
        )}
      </div>


    </div>
  );
}