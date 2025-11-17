import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Install instructions
  const [showInstallHint, setShowInstallHint] = useState(false);
  const [os, setOs] = useState(null);

  // Detect OS (but don't show yet)
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setOs("ios");
    else if (/android/.test(ua)) setOs("android");
  }, []);

  // Show hint ONLY after conversion
  const triggerInstallHint = () => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (!standalone && (os === "ios" || os === "android")) {
      setShowInstallHint(true);
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    setError("");
    setResults(null);

    if (!youtubeUrl.trim()) {
      setError("Please paste a YouTube link.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "https://yt-to-spotify-backend.onrender.com/api/convert",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ youtubeUrl }),
        }
      );

      if (!res.ok) throw new Error("Failed to convert link");

      const data = await res.json();
      setResults(data);

      // Show install hint AFTER conversion
      triggerInstallHint();
    } catch (err) {
      console.error(err);
      setError("Something went wrong converting the link.");
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceLabel = () => {
    if (!results) return "";
    const c = results.confidence ?? 0;
    const type = results.matchType;

    if (type === "exact") return "Exact match";
    if (type === "high") return "High confidence match";
    if (type === "medium") return "Medium confidence – looks right";
    if (type === "low") return "Low confidence – using search results";
    if (type === "very_low") return "Very low confidence – using search only";
    if (c >= 90) return "Exact match";
    if (c >= 75) return "High confidence match";
    if (c >= 50) return "Medium confidence";
    return "Low confidence – using search";
  };

  const isSearchMode = () => {
    if (!results) return false;
    return (results.confidence ?? 0) < 74;
  };

  return (
    <div className="app">
      <h1>YouTube → Music Link Converter</h1>
      <p className="subtitle">Paste a YouTube link and get Spotify & Apple Music matches.</p>

      {/* ---- SUBTLE INSTALL BANNER (AFTER FIRST USE) ---- */}
      {showInstallHint && (
        <div className="install-hint">
          {os === "ios" && (
            <p>
              💡 <strong>Tip:</strong> Add this app to your Home Screen:<br />
              Share → <strong>Add to Home Screen</strong>
            </p>
          )}
          {os === "android" && (
            <p>
              💡 <strong>Tip:</strong> Install this app:<br />
              Menu (⋮) → <strong>Install App</strong>
            </p>
          )}
          <button
            className="hint-dismiss"
            onClick={() => setShowInstallHint(false)}
          >
            ✕
          </button>
        </div>
      )}
      {/* ------------------------------------------------ */}

      <form onSubmit={handleConvert} className="card">
        <label htmlFor="youtube">YouTube URL</label>
        <input
          id="youtube"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
        <button disabled={loading} type="submit">
          {loading ? "Converting..." : "Convert"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {results && (
        <div className="result card">
          <h2>Results</h2>

          <p><strong>YouTube Title:</strong> {results.youtubeTitle}</p>
          <p><strong>Search Query:</strong> {results.cleanedQuery}</p>

          <div className={`match-pill match-pill-${results.matchType || "unknown"}`}>
            {getConfidenceLabel()} • {results.confidence ?? 0}%
          </div>

          <div className="links">
            {results.spotifyUrl && (
              <a
                className="link-button spotify"
                href={results.spotifyUrl}
                target="_blank"
                rel="noreferrer"
              >
                {isSearchMode()
                  ? `Spotify • search (${results.confidence ?? 0}%)`
                  : `Spotify • ${results.confidence ?? 0}%`}
              </a>
            )}

            {results.appleMusicUrl && (
              <a
                className="link-button apple"
                href={results.appleMusicUrl}
                target="_blank"
                rel="noreferrer"
              >
                {isSearchMode()
                  ? `Apple Music • search (${results.confidence ?? 0}%)`
                  : `Apple Music • ${results.confidence ?? 0}%`}
              </a>
            )}

            {results.soundCloudUrl && (
              <a
                className="link-button soundcloud"
                href={results.soundCloudUrl}
                target="_blank"
                rel="noreferrer"
              >
                SoundCloud • search
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
