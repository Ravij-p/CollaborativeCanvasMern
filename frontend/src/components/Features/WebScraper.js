import React, { useState } from "react";
import api from "../../utils/api";

const WebScraper = () => {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");

  const handleScrape = async () => {
    try {
      const res = await api.post("/api/scrape", { url });
      setContent(res.data.content || res.data);
    } catch (err) {
      alert("Error scraping website");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Web Scraper</h2>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter website URL"
        className="border px-2 py-1 w-full"
      />
      <button
        onClick={handleScrape}
        className="mt-2 bg-purple-500 px-4 py-2 text-white"
      >
        Scrape
      </button>
      {content && <pre className="mt-4 whitespace-pre-wrap">{content}</pre>}
    </div>
  );
};

export default WebScraper;
