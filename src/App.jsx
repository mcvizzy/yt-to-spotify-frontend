import { useState } from "react";
import "./App.css";

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    if (type === "low") return "Low confidence – using search";
    if (type === "very_low") return "Very low confidence – using search";

    if (c >= 90) return "Exact match";
    if (c >= 75) return "High confidence";
    if (c >= 50) return "Medium confidence";
    return "Low confidence – search mode";
  };

  const isSearchMode = () => {
    if (!results) return false;
    return (results.confidence ?? 0) < 74;
  };

  return (
    <div className="app">
      <h1>YouTube → Music Link Converter</h1>
      <p className="subtitle">Paste a YouTube link and get Spotify & Apple Music matches.</p>

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
            {/* Spotify */}
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

            {/* Apple Music */}
            {results.appleMusicUrl && (
              <a
                className="link-button apple"
                href={results.appleMusicUrl}
                target="_blank"
                rel="noreferrer"
              >
                {isSearchMode()
                  ? `Apple • search (${results.confidence ?? 0}%)`
                  : `Apple • ${results.confidence ?? 0}%`}
              </a>
            )}

            {/* SoundCloud */}
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
