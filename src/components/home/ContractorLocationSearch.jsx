import { useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ContractorLocationSearch() {
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchType, setSearchType] = useState("contractors");

  const categories = [
    { id: "contractors", label: "Contractors", icon: "🔧" },
    { id: "market-booths", label: "Market Booths", icon: "🏪" },
    { id: "farmers-markets", label: "Farmers Markets", icon: "🌾" },
    { id: "vendors", label: "Vendors", icon: "🛍️" },
    { id: "swapmeets", label: "SwapMeets", icon: "🏬" }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location.trim()) return;

    setIsLoading(true);
    setSearched(true);

    try {
      let searchResults = [];

      if (searchType === "contractors") {
        searchResults = await base44.entities.Contractor.filter({
          location: { $regex: location, $options: "i" }
        });
      } else if (searchType === "market-booths") {
        searchResults = await base44.entities.MarketShop.filter({
          location: { $regex: location, $options: "i" }
        });
      } else if (searchType === "farmers-markets") {
        searchResults = await base44.entities.MarketShop.filter({
          location: { $regex: location, $options: "i" },
          market_type: "farmers_market"
        });
      } else if (searchType === "vendors") {
        searchResults = await base44.entities.MarketShop.filter({
          location: { $regex: location, $options: "i" }
        });
      } else if (searchType === "swapmeets") {
        searchResults = await base44.entities.MarketShop.filter({
          location: { $regex: location, $options: "i" },
          market_type: "swapmeet"
        });
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
      <div style={{ background: "rgba(10, 22, 40, 0.6)", border: "1px solid rgba(29, 111, 164, 0.3)", borderRadius: "14px", padding: "24px 20px", backdropFilter: "blur(18px)" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#ffffff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <MapPin size={20} style={{ color: "#1d6fa4" }} />
          Search Near You
        </h3>

        {/* Category Selector */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSearchType(cat.id)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: searchType === cat.id ? "1px solid #1d6fa4" : "1px solid rgba(255, 255, 255, 0.2)",
                background: searchType === cat.id ? "rgba(29, 111, 164, 0.2)" : "transparent",
                color: searchType === cat.id ? "#1d6fa4" : "rgba(255, 255, 255, 0.7)",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => {
                if (searchType !== cat.id) {
                  e.currentTarget.style.borderColor = "rgba(29, 111, 164, 0.4)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.9)";
                }
              }}
              onMouseLeave={(e) => {
                if (searchType !== cat.id) {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
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
            <input
              type="text"
              placeholder="Search by city, zip code, or region..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
                minHeight: "44px"
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(29, 111, 164, 0.6)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.15)"}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#1d6fa4",
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
              {isLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={16} />}
              {!isLoading && "Search"}
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", margin: "0" }}>Search by location to find verified professionals in your area</p>
        </form>

        {/* Results */}
        {searched && (
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Loader2 size={24} style={{ color: "#1d6fa4", animation: "spin 1s linear infinite", margin: "0 auto" }} />
              </div>
            ) : results.length > 0 ? (
              <div>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "rgba(255, 255, 255, 0.8)", marginBottom: "12px" }}>
                  Found {results.length} contractor{results.length !== 1 ? "s" : ""}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 600 ? "1fr" : "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                  {results.slice(0, 6).map((contractor) => (
                    <div
                      key={contractor.id}
                      onClick={() => window.location.href = `/contractor/${contractor.id}`}
                      style={{
                        padding: "14px 12px",
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(29, 111, 164, 0.2)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(29, 111, 164, 0.15)";
                        e.currentTarget.style.borderColor = "rgba(29, 111, 164, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                        e.currentTarget.style.borderColor = "rgba(29, 111, 164, 0.2)";
                      }}
                    >
                      <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {contractor.name}
                      </p>
                      {contractor.line_of_work && (
                        <p style={{ margin: "0 0 4px", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {contractor.line_of_work.replace(/_/g, " ")}
                        </p>
                      )}
                      <p style={{ margin: "0", fontSize: "12px", color: "#1d6fa4", fontWeight: "600" }}>
                        {contractor.location}
                      </p>
                      {contractor.rating && (
                        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>
                          ⭐ {contractor.rating.toFixed(1)} ({contractor.reviews_count || 0})
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {results.length > 6 && (
                  <button
                    onClick={() => window.location.href = '/FindContractors'}
                    style={{
                      width: "100%",
                      marginTop: "16px",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(29, 111, 164, 0.4)",
                      background: "transparent",
                      color: "#1d6fa4",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(29, 111, 164, 0.1)";
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
                <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px", margin: "0" }}>
                  No contractors found in "{location}". Try a different location or browse all contractors.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}