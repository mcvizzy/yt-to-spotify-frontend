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

  const renderResults = () => {
    if (!results) return null;

    const confidence = results.confidence ?? 0;
    const highConfidence = confidence >= 75;

    const spotifyHref = highConfidence && results.spotifyUrl
      ? results.spotifyUrl
      : `https://open.spotify.com/search/${encodeURIComponent(
          results.cleanedQuery || ""
        )}`;

    const appleHref = highConfidence && results.appleMusicUrl
      ? results.appleMusicUrl
      : `https://music.apple.com/search?term=${encodeURIComponent(
          results.cleanedQuery || ""
        )}`;

    const soundCloudHref =
      results.soundCloudUrl ||
      `https://soundcloud.com/search?q=${encodeURIComponent(
        results.cleanedQuery || ""
      )}`;

    const spotifyLabel = highConfidence
      ? `Spotify • ${confidence}% match`
      : `Spotify • ${confidence}% • search`;

    const appleLabel = highConfidence
      ? `Apple Music • ${confidence}% match`
      : `Apple Music • ${confidence}% • search`;

    return (
      <div className="result card">
        <h2>Results</h2>

        {results.youtubeTitle && (
          <p>
            <strong>YouTube Title:</strong> {results.youtubeTitle}
          </p>
        )}

        {results.cleanedQuery && (
          <p>
            <strong>Search Query:</strong> {results.cleanedQuery}
          </p>
        )}

        <div className="links">
          <a
            className={`link-button spotify ${
              highConfidence ? "high-confidence" : "low-confidence"
            }`}
            href={spotifyHref}
            target="_blank"
            rel="noreferrer"
          >
            {spotifyLabel}
          </a>

          <a
            className={`link-button apple ${
              highConfidence ? "high-confidence" : "low-confidence"
            }`}
            href={appleHref}
            target="_blank"
            rel="noreferrer"
          >
            {appleLabel}
          </a>

          <a
            className="link-button soundcloud"
            href={soundCloudHref}
            target="_blank"
            rel="noreferrer"
          >
            SoundCloud • search
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <h1>YouTube → Music Link Converter</h1>
      <p className="subtitle">
        Paste a YouTube link and get Spotify & Apple Music matches.
      </p>

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

      {renderResults()}
    </div>
  );
}

export default App;
