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
    const res = await fetch("https://yt-to-spotify-backend.onrender.com/api/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ youtubeUrl }),
    });

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
