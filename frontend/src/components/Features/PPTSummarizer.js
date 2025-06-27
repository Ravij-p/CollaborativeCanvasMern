import React, { useState } from "react";
import api from "../../utils/api";

const PPTSummarizer = () => {
  const [ppt, setPpt] = useState(null);
  const [summary, setSummary] = useState("");

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("file", ppt);

    try {
      const res = await api.post("/api/summarize", formData);
      setSummary(res.data.summary || res.data); // adjust if different key
    } catch (err) {
      alert("Error summarizing PPT");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Summarize PPT</h2>
      <input type="file" onChange={(e) => setPpt(e.target.files[0])} />
      <button
        onClick={handleSubmit}
        className="mt-2 bg-green-500 px-4 py-2 text-white"
      >
        Summarize
      </button>
      {summary && <pre className="mt-4 whitespace-pre-wrap">{summary}</pre>}
    </div>
  );
};

export default PPTSummarizer;
