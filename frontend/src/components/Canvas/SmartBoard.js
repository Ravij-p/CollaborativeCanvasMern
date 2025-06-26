import React, { useState } from "react";
import Canvas from "./Canvas";
import PDFAnnotator from "./PDFAnnotator";

const SmartBoard = ({ roomId }) => {
  const [mode, setMode] = useState("canvas"); // 'canvas' | 'pdf'

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Room ID: {roomId}</h2>

      {/* Toolbar for switching */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setMode("canvas")}
          className={`px-3 py-1 rounded ${
            mode === "canvas" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          🖌️ Whiteboard
        </button>
        <button
          onClick={() => setMode("pdf")}
          className={`px-3 py-1 rounded ${
            mode === "pdf" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          📄 PDF Annotator
        </button>
      </div>

      {/* Render selected tool */}
      {mode === "canvas" ? (
        <Canvas roomId={roomId} />
      ) : (
        <PDFAnnotator roomId={roomId} />
      )}
    </div>
  );
};

export default SmartBoard;
