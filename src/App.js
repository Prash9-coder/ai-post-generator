import { useEffect, useState } from "react";

function App() {
  // INPUT STATES
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Fun");
  const [platform, setPlatform] = useState("Instagram");

  // OUTPUT STATES
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [cta, setCta] = useState("");
  const [raw, setRaw] = useState("");

  // OTHER STATES
  const [loading, setLoading] = useState(false);

  // THEME (dark mode)
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("dark-mode");
      return saved === "true" || false;
    } catch {
      return false;
    }
  });

  // Apply theme class to html root
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("dark-mode", dark ? "true" : "false");
    } catch { }
  }, [dark]);

  // COPY ALL TEXT
  const copyToClipboard = () => {
    const fullText = `Caption:\n${caption}\n\nHashtags:\n${hashtags}\n\nCTA:\n${cta}`;
    navigator.clipboard.writeText(fullText);
    // small visual feedback
    toast("Copied to clipboard 📋");
  };

  // Small toast (temporary)
  const toast = (msg) => {
    const el = document.createElement("div");
    el.textContent = msg;
    el.className =
      "fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-md z-50";
    // adjust for dark mode
    if (document.documentElement.classList.contains("dark")) {
      el.className =
        "fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-md z-50";
    }
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  };

  // FETCH AI RESULT FROM BACKEND
  const generatePost = async () => {
    if (!topic.trim()) {
      toast("Please enter a topic");
      return;
    }

    setLoading(true);
    setCaption("");
    setHashtags("");
    setCta("");
    setRaw("");

    try {
      const res = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, platform }),
      });

      const data = await res.json();

      if (!res.ok) {
        // show error from backend
        console.error("API error", data);
        toast("API error: " + (data.error || res.statusText));
      } else {
        setCaption(data.caption || "");
        setHashtags(data.hashtags || "");
        setCta(data.cta || "");
        setRaw(data.raw || "");
      }
    } catch (error) {
      console.error(error);
      toast("Network error. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              AI Social Media Post Generator 🚀
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Create captions, hashtags and CTAs — fast.
            </p>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDark((d) => !d)}
              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 px-3 py-2 rounded-full hover:scale-105 transition"
            >
              {dark ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
        </header>

        {/* Input Card */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 transition-colors">
          <label className="font-medium text-gray-700 dark:text-gray-200">Post Topic</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-2 mb-4 w-full border rounded p-2 bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="e.g., Fitness Motivation"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="font-medium text-gray-700 dark:text-gray-200">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="mt-2 w-full border rounded p-2 bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option>Fun</option>
                <option>Professional</option>
                <option>Inspirational</option>
                <option>Casual</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-gray-700 dark:text-gray-200">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="mt-2 w-full border rounded p-2 bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option>Instagram</option>
                <option>Twitter</option>
                <option>LinkedIn</option>
                <option>Facebook</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generatePost}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
              >
                {loading ? "Generating..." : "Generate Post"}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 transition-colors">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Generated Output</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span>AI is thinking... 🔄</span>
              </div>
            </div>
          ) : caption || hashtags || cta ? (
            <div className="space-y-4">
              {/* Caption */}
              <div className="border-l-4 border-blue-600 bg-blue-50 dark:bg-opacity-10 dark:border-blue-400 p-4 rounded shadow-sm">
                <h3 className="text-md font-bold text-blue-700 dark:text-blue-300 mb-1">✨ Caption</h3>
                <p className="text-gray-800 dark:text-gray-100 whitespace-pre-line">{caption}</p>
              </div>

              {/* Hashtags */}
              <div className="border-l-4 border-green-600 bg-green-50 dark:bg-opacity-10 dark:border-green-400 p-4 rounded shadow-sm">
                <h3 className="text-md font-bold text-green-700 dark:text-green-300 mb-1">#️⃣ Hashtags</h3>
                <p className="text-gray-800 dark:text-gray-100 whitespace-pre-line">{hashtags}</p>
              </div>

              {/* CTA */}
              <div className="border-l-4 border-purple-600 bg-purple-50 dark:bg-opacity-10 dark:border-purple-400 p-4 rounded shadow-sm">
                <h3 className="text-md font-bold text-purple-700 dark:text-purple-300 mb-1">📣 CTA</h3>
                <p className="text-gray-800 dark:text-gray-100 whitespace-pre-line">{cta}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
                >
                  📋 Copy All
                </button>

                <button
                  onClick={() => {
                    // copy caption only
                    navigator.clipboard.writeText(caption);
                    toast("Caption copied 📋");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Copy Caption
                </button>
              </div>

              {/* Raw output toggle */}
              {raw && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-300">View raw output</summary>
                  <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded whitespace-pre-wrap">{raw}</pre>
                </details>
              )}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">Your AI generated post will appear here...</p>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Built with ❤️ • AI Social Post Genie
        </footer>
      </div>
    </div>
  );
}

export default App;
