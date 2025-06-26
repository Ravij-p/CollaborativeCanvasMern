import React, { useState } from "react";
import PDFViewer from "./PDFViewer";
import OverlayCanvas from "./OverlayCanvas";

const PDFAnnotator = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [size, setSize] = useState({ width: 800, height: 600 });

  const handlePDFUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    }
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={handlePDFUpload} />
      {pdfUrl && (
        <div
          style={{
            position: "relative",
            width: `${size.width}px`,
            height: `${size.height}px`,
            border: "1px solid #ccc",
            marginTop: "10px",
          }}
        >
          {/* PDF renders below */}
          <div style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}>
            <PDFViewer
              fileUrl={pdfUrl}
              width={size.width}
              height={size.height}
            />
          </div>

          {/* Canvas overlays on top */}
          <OverlayCanvas width={size.width} height={size.height} />
        </div>
      )}
    </div>
  );
};

export default PDFAnnotator;
