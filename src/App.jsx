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

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong converting the link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app fade-in">
      <div className="vaporwave-bg"></div>

      <h1 className="title-glow">YouTube → Music Link Converter</h1>
      <p className="subtitle">Paste a YouTube link and get platform matches.</p>

      <form onSubmit={handleConvert} className="card neon-card">
        <label htmlFor="youtube">YouTube URL</label>
        <input
          id="youtube"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
        <button disabled={loading} type="submit" className="convert-btn">
          {loading ? (
            <div className="soundwave">
              <span></span><span></span><span></span><span></span>
            </div>
          ) : (
            "Convert"
          )}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {results && (
        <div className="result card neon-card">
          <h2 className="result-title">Results</h2>

          <p><strong>YouTube Title:</strong> {results.youtubeTitle}</p>
          <p><strong>Search Query:</strong> {results.cleanedQuery}</p>

          <div className="confidence-meter">
            <div
              className="confidence-fill"
              style={{ width: `${results.confidence}%` }}
            ></div>
          </div>

          <p className="confidence-text">
            {results.confidence}% Match Confidence
          </p>

          <div className="links">
            {results.spotifyUrl && (
              <a className="link-button spotify neon-btn"
                href={results.spotifyUrl}
                target="_blank"
                rel="noreferrer">
                Open in Spotify
              </a>
            )}

            {results.appleMusicUrl && (
              <a className="link-button apple neon-btn"
                href={results.appleMusicUrl}
                target="_blank"
                rel="noreferrer">
                Open in Apple Music
              </a>
            )}

            {results.soundCloudUrl && (
              <a className="link-button soundcloud neon-btn"
                href={results.soundCloudUrl}
                target="_blank"
                rel="noreferrer">
                Search on SoundCloud
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
