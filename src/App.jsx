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

  return (
    <div className="app">
      <h1>YouTube → Music Link Converter</h1>
      <p className="subtitle">Convert any YouTube video into platform links.</p>

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

          <p>
            <strong>YouTube Title:</strong> {results.youtubeTitle}
          </p>
          <p>
            <strong>Search Query:</strong> {results.cleanedQuery}
          </p>

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
  );
}

export default App;
