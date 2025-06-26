import React, { useState } from "react";
import api from "../../utils/api";

const WebScraper = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");

  const scrape = async () => {
    const res = await api.post("/tools/scrape", { url });
    setResult(res.data.content);
  };

  return (
    <div>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste URL"
      />
      <button onClick={scrape}>Scrape</button>
      <pre>{result}</pre>
    </div>
  );
};

export default WebScraper;
