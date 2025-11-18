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
      setError("Please paste a YouTube or TikTok link.");
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

  const confidenceClass = (value) => {
    if (value >= 90) return "conf-green";
    if (value >= 75) return "conf-yellow";
    if (value >= 50) return "conf-orange";
    return "conf-red";
  };

  const platformLabel = (platform) => {
    if (platform === "youtube") return "YouTube link detected";
    if (platform === "tiktok") return "TikTok sound detected";
    return "Unknown source";
  };

  return (
    <div className="app">
      <div className="app-inner">
        <h1 className="app-title">YT → Music Converter</h1>
        <p className="subtitle">
          Paste a YouTube or TikTok link and get Spotify &amp; Apple Music matches.
        </p>

        <form onSubmit={handleConvert} className="card input-card">
          <label htmlFor="youtube">Paste link</label>
          <div className="input-row">
            <input
              id="youtube"
              type="url"
              placeholder="https://www.youtube.com/watch?v=... or https://www.tiktok.com/..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            <button disabled={loading} type="submit">
              {loading ? "Converting..." : "Convert"}
            </button>
          </div>
          <p className="input-hint">
            Works with both <strong>YouTube videos</strong> and{" "}
            <strong>TikTok sounds</strong>.
          </p>
        </form>

        {error && <p className="error">{error}</p>}

        {results && (
          <div className="card result-card">
            <div className="platform-pill">
              {platformLabel(results.platform)}
            </div>

            <h2>Match Result</h2>

            <p>
              <strong>Title:</strong> {results.youtubeTitle}
            </p>
            {results.artist && (
              <p>
                <strong>Artist:</strong> {results.artist}
              </p>
            )}
            <p>
              <strong>Search Query:</strong> {results.cleanedQuery}
            </p>

            <div className="confidence-section">
              <div
                className={`confidence-text ${confidenceClass(
                  results.confidence
                )}`}
              >
                {results.confidence}% match confidence
              </div>
              <div className="confidence-bar">
                <div
                  className={`confidence-bar-fill ${confidenceClass(
                    results.confidence
                  )}`}
                  style={{
                    width: `${Math.min(
                      Math.max(results.confidence || 0, 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="links">
              {results.spotifyUrl && (
                <a
                  className="link-button spotify"
                  href={results.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Spotify
                </a>
              )}

              {results.appleMusicUrl && (
                <a
                  className="link-button apple"
                  href={results.appleMusicUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Apple Music
                </a>
              )}

              {results.soundCloudUrl && (
                <a
                  className="link-button soundcloud"
                  href={results.soundCloudUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Search on SoundCloud
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
