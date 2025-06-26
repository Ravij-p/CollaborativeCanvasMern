import React, { useState } from "react";
import api from "../../utils/api";

const PPTSummarizer = () => {
  const [pptText, setPptText] = useState("");
  const [summary, setSummary] = useState("");

  const summarize = async () => {
    const res = await api.post("/tools/summarize", { content: pptText });
    setSummary(res.data.summary);
  };

  return (
    <div>
      <textarea
        onChange={(e) => setPptText(e.target.value)}
        placeholder="Paste PPT text"
      />
      <button onClick={summarize}>Summarize</button>
      <p>{summary}</p>
    </div>
  );
};

export default PPTSummarizer;
