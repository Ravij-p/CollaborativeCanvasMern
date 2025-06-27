import React, { useState } from "react";
import api from "../../utils/api";

const ToolboxPanel = ({ visible, onClose, socket, roomId }) => {
  const [activeTab, setActiveTab] = useState("question");
  const [syllabus, setSyllabus] = useState(null);
  const [pyqs, setPyqs] = useState(null);
  const [pptFile, setPptFile] = useState(null);
  const [scrapeURL, setScrapeURL] = useState("");
  const [output, setOutput] = useState("");
  const [pptSummaryResult, setPptSummaryResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateQuestions = async () => {
    const formData = new FormData();
    formData.append("syllabus", syllabus);
    formData.append("pyqs", pyqs);
    try {
      const res = await api.post("/tools/questions", formData);
      setOutput(res.data.questions);
      socket.emit("toolbox-output", { roomId, output: res.data.questions });
    } catch (err) {
      alert("Question generation failed");
    }
  };
  const handleSummarizePPT = async () => {
    if (!pptFile) return;
    const formData = new FormData();
    formData.append("file", pptFile);
    setLoading(true);
    try {
      const res = await api.post("/tools/summarize", formData);
      setPptSummaryResult(res.data.summary); // [{ slide: [1,2], summary: "", image: [...] }]
      setOutput("");
      socket.emit("toolbox-output", { roomId, output: res.data.summary });
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      alert("PPT summarization failed: " + message);
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeWebsite = async () => {
    try {
      const res = await api.post("/tools/scrape", { url: scrapeURL });
      setOutput(res.data.content);
      socket.emit("toolbox-output", { roomId, output: res.data.content });
    } catch (err) {
      alert("Web scraping failed");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-200 border-t p-4 z-50 shadow-xl max-h-[50vh] overflow-auto">
      <div className="flex justify-between items-center mb-3">
        <div className="space-x-2">
          <button
            onClick={() => setActiveTab("question")}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Question
          </button>
          <button
            onClick={() => setActiveTab("ppt")}
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            Summarize
          </button>
          <button
            onClick={() => setActiveTab("scrape")}
            className="px-3 py-1 bg-yellow-500 text-black rounded"
          >
            Scrape
          </button>
        </div>
        <button onClick={onClose} className="text-red-600 font-bold text-lg">
          ✖
        </button>
      </div>

      {activeTab === "question" && (
        <div>
          <h2 className="text-lg font-semibold">Generate Questions</h2>
          <input
            type="file"
            onChange={(e) => setSyllabus(e.target.files[0])}
            className="my-2"
          />
          <input
            type="file"
            onChange={(e) => setPyqs(e.target.files[0])}
            className="my-2"
          />
          <button
            onClick={handleGenerateQuestions}
            className="px-4 py-1 bg-blue-600 text-white rounded"
          >
            Generate
          </button>
        </div>
      )}

      {activeTab === "ppt" && (
        <div>
          <h2 className="text-lg font-semibold">Summarize PPT</h2>
          <input
            type="file"
            onChange={(e) => setPptFile(e.target.files[0])}
            className="my-2"
          />
          <button
            onClick={handleSummarizePPT}
            disabled={loading}
            className="px-4 py-1 bg-green-600 text-white rounded"
          >
            {loading ? "Summarizing..." : "Summarize"}
          </button>
        </div>
      )}

      {activeTab === "scrape" && (
        <div>
          <h2 className="text-lg font-semibold">Scrape Website</h2>
          <input
            type="text"
            value={scrapeURL}
            onChange={(e) => setScrapeURL(e.target.value)}
            placeholder="Enter URL"
            className="p-1 w-full my-2 border border-gray-400"
          />
          <button
            onClick={handleScrapeWebsite}
            className="px-4 py-1 bg-yellow-500 rounded"
          >
            Scrape
          </button>
        </div>
      )}

      {output && (
        <div
          style={{
            whiteSpace: "pre-wrap", // wrap long lines
            wordWrap: "break-word", // break long words
            overflowY: "auto", // scroll if too tall
            overflowX: "hidden", // prevent horizontal scroll
            maxHeight: "400px", // or any value you prefer
            width: "100%", // match parent width
            backgroundColor: "#f9f9f9",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
            marginTop: "10px",
          }}
        >
          {output || "No content yet."}
          {pptSummaryResult.length > 0 && (
            <div className="mt-4 space-y-4 overflow-auto max-h-[250px]">
              {pptSummaryResult.map((entry, idx) => (
                <div key={idx} className="bg-white border p-3 rounded shadow">
                  <p className="font-semibold text-sm mb-2">
                    🖼️ Slides {entry.slide[0]} – {entry.slide[1]}
                  </p>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {entry.summary}
                  </p>
                  {entry.image?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.image.map((img, i) => (
                        <img
                          key={i}
                          src={`http://localhost:5000/output/${img}`}
                          alt={`Slide ${entry.slide[0]} Img ${i + 1}`}
                          className="w-32 h-auto border rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolboxPanel;
