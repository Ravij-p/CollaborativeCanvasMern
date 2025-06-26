import React, { useRef, useState, useEffect, useContext } from "react";
import { getDocument, GlobalWorkerOptions, version } from "pdfjs-dist";
import { AuthContext } from "../../context/AuthContext";
import useSocket from "../../hooks/useSocket";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import api from "../../utils/api";

GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

const Canvas = ({ roomId }) => {
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);
  const pdfRef = useRef(null);
  const { user } = useContext(AuthContext);
  const socket = useSocket(roomId, user);
  const [penSize, setPenSize] = useState(2);
  const [eraserSize, setEraserSize] = useState(20);
  const [color, setColor] = useState("#000000");
  const [mode, setMode] = useState("pen");
  const [drawing, setDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [drawHistory, setDrawHistory] = useState([]);
  const [extraHeight, setExtraHeight] = useState(0);
  const [shapeStart, setShapeStart] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [redoStack, setRedoStack] = useState([]);

  // Get mouse position relative to canvas + scroll
  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scrollTop = scrollRef.current.scrollTop;
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top, // ✅ critical
    };
  };

  const interpolatePoints = (x0, y0, x1, y1, steps = 10) => {
    const points = [];
    for (let i = 0; i <= steps; i++) {
      const x = x0 + ((x1 - x0) * i) / steps;
      const y = y0 + ((y1 - y0) * i) / steps;
      points.push({ x, y });
    }
    return points;
  };
  const handleUndo = () => {
    if (drawHistory.length === 0) return;
    const newHistory = [...drawHistory];
    const undone = newHistory.pop();
    setDrawHistory(newHistory);
    setRedoStack((prev) => [...prev, undone]);
    redrawHistory(newHistory); // 🖌️ redraw canvas
    socket.emit("update-history", newHistory); // 🔄 sync
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const restored = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    const newHistory = [...drawHistory, restored];

    setDrawHistory(newHistory);
    setRedoStack(newRedoStack);
    redrawHistory(newHistory); // 🖌️ redraw canvas
    socket.emit("update-history", newHistory); // 🔄 sync
  };

  const drawStroke = (ctx, stroke) => {
    ctx.lineJoin = "round"; // Smooth joins
    ctx.lineCap = "round"; // Smooth ends
    ctx.lineWidth = stroke.thickness || 2;
    ctx.strokeStyle = stroke.color || "#000";
    ctx.globalCompositeOperation =
      stroke.mode === "eraser" ? "destination-out" : "source-over";

    if (stroke.type === "text") {
      ctx.fillStyle = stroke.color;
      ctx.font = "16px sans-serif";
      ctx.fillText(stroke.text, stroke.x, stroke.y);
    } else if (stroke.mode === "rect") {
      ctx.strokeRect(
        stroke.fromX,
        stroke.fromY,
        stroke.toX - stroke.fromX,
        stroke.toY - stroke.fromY
      );
    } else if (stroke.mode === "line") {
      ctx.beginPath();
      ctx.moveTo(stroke.fromX, stroke.fromY);
      ctx.lineTo(stroke.toX, stroke.toY);
      ctx.stroke();
    } else {
      // Pen, highlighter, eraser
      ctx.beginPath();
      ctx.moveTo(stroke.fromX, stroke.fromY);
      ctx.lineTo(stroke.toX, stroke.toY);
      ctx.stroke();

      // Optional: fill arc to fix gaps in thick fast lines
      ctx.beginPath();
      ctx.arc(stroke.toX, stroke.toY, ctx.lineWidth / 2, 0, 2 * Math.PI);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
    }
  };

  const handleMouseDown = (e) => {
    const { x, y } = getCoords(e);

    if (mode === "pen" || mode === "eraser" || mode === "highlighter") {
      // Use your existing startDrawing behavior
      setLastPos({ x, y });
      setDrawing(true);
    } else if (mode === "text") {
      const input = prompt("Enter text:");
      if (input) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.fillStyle = color;
        ctx.font = "16px sans-serif";
        ctx.fillText(input, x, y);
        const stroke = { type: "text", x, y, text: input, color, mode };
        setDrawHistory((prev) => [...prev, stroke]);
        socket.emit("draw", stroke);
      }
    } else if (mode === "rect" || mode === "line") {
      setDrawing(true);
      setShapeStart({ x, y });
    }
  };

  const handleMouseUp = (e) => {
    if (!drawing || !canvasRef.current) return;

    setDrawing(false); // ✅ always stop drawing

    const { x, y } = getCoords(e);
    const ctx = canvasRef.current.getContext("2d");

    if (mode === "pen" || mode === "eraser" || mode === "highlighter") {
      // nothing to do — drawing already handled in mouseMove
      return;
    }

    if (!shapeStart) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = penSize;
    ctx.globalCompositeOperation = "source-over";

    ctx.beginPath();
    if (mode === "rect") {
      ctx.strokeRect(
        shapeStart.x,
        shapeStart.y,
        x - shapeStart.x,
        y - shapeStart.y
      );
    } else if (mode === "line") {
      ctx.moveTo(shapeStart.x, shapeStart.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    const shape = {
      type: mode,
      fromX: shapeStart.x,
      fromY: shapeStart.y,
      toX: x,
      toY: y,
      color,
      mode,
      thickness: penSize,
    };

    setDrawHistory((prev) => [...prev, shape]);
    socket.emit("draw", shape);
    setShapeStart(null);
  };
  useEffect(() => {
    const stop = () => setDrawing(false);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
    };
  }, []);

  const redrawHistory = (history = []) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    history.forEach((stroke) => {
      drawStroke(ctx, stroke); // Your central drawing function
    });
  };

  const startDrawing = (e) => {
    const { x, y } = getCoords(e);
    setLastPos({ x, y });
    setDrawing(true);
  };

  const stopDrawing = () => {
    setDrawing(false);
  };
  const handleMouseMove = (e) => {
    if (!drawing || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getCoords(e);

    if (["pen", "eraser", "highlighter"].includes(mode)) {
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      if (mode === "highlighter") {
        ctx.strokeStyle = "rgba(255,255,0,0.3)";
        ctx.globalCompositeOperation = "multiply";
        ctx.lineWidth = penSize;
      } else if (mode === "eraser") {
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = eraserSize;
      } else {
        ctx.strokeStyle = color;
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = penSize;
      }

      // ✨ Use interpolated points
      const steps = Math.ceil(
        Math.hypot(x - lastPos.x, y - lastPos.y) / (ctx.lineWidth / 2)
      );
      const points = interpolatePoints(lastPos.x, lastPos.y, x, y, steps);

      points.forEach((point, i) => {
        if (i === 0) return;
        const prev = points[i - 1];
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      });

      const stroke = {
        fromX: lastPos.x,
        fromY: lastPos.y,
        toX: x,
        toY: y,
        color: ctx.strokeStyle,
        mode,
        thickness: ctx.lineWidth,
      };

      setDrawHistory((prev) => [...prev, stroke]);
      socket.emit("draw", stroke);
      setLastPos({ x, y });
    }
  };

  const resizeCanvas = () => {
    if (!scrollRef.current || !canvasRef.current) return;
    const scroll = scrollRef.current;
    const canvas = canvasRef.current;
    canvas.width = scroll.scrollWidth;
    canvas.height = scroll.scrollHeight;
    redrawHistory(drawHistory);
  };

  const renderPDF = async (url) => {
    const loadingTask = getDocument(url);
    const pdf = await loadingTask.promise;
    setPdfDoc(pdf);
    setNumPages(pdf.numPages);

    const container = pdfRef.current;
    container.innerHTML = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });

      const pageCanvas = document.createElement("canvas");
      const ctx = pageCanvas.getContext("2d");
      pageCanvas.width = viewport.width;
      pageCanvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;

      pageCanvas.style.display = "block";
      pageCanvas.style.margin = "20px auto";
      container.appendChild(pageCanvas);
    }

    // Spacer for infinite area
    const spacer = document.createElement("div");
    spacer.style.height = `${extraHeight + 1000}px`;
    container.appendChild(spacer);

    setTimeout(resizeCanvas, 300);
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/tools/upload-pdf", formData);
    const pdfUrl = res.data.url;

    // Broadcast via socket to others
    socket.emit("pdf-uploaded", { roomId, url: pdfUrl });

    // Render locally
    renderPDF(pdfUrl);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setDrawHistory([]);
    socket.emit("clear-canvas");
  };

  const saveAsPNG = () => {
    html2canvas(scrollRef.current).then((canvasImg) => {
      const link = document.createElement("a");
      link.href = canvasImg.toDataURL("image/png");
      link.download = `canvas-${roomId}.png`;
      link.click();
    });
  };

  const saveAsPDF = () => {
    html2canvas(scrollRef.current).then((canvasImg) => {
      const imgData = canvasImg.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvasImg.height * width) / canvasImg.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`canvas-${roomId}.pdf`);
    });
  };

  const expandCanvas = () => {
    setExtraHeight((prev) => {
      const newHeight = prev + 1000;
      const spacer = document.createElement("div");
      spacer.style.height = "1000px";
      pdfRef.current.appendChild(spacer);
      setTimeout(resizeCanvas, 100);
      return newHeight;
    });
  };

  // 🧠 Socket handlers
  useEffect(() => {
    if (!socket || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    socket.on("draw", (stroke) => {
      drawStroke(ctx, stroke);
      setDrawHistory((prev) => [...prev, stroke]);
    });

    socket.on("clear-canvas", () => {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setDrawHistory([]);
    });
    socket.on("update-history", (history) => {
      setDrawHistory(history);
      setRedoStack([]);
      redrawHistory(history);
    });
    socket.on("pdf-uploaded", ({ buffer }) => {
      console.log("PDF received");
      const blob = new Blob([buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      renderPDF(url); // this MUST call full page render and resize canvas
    });
    socket.on("pdf-received", ({ url }) => {
      renderPDF(url);
    });
    return () => {
      socket.off("draw");
      socket.off("clear-canvas");
      socket.off("pdf-uploaded");
      socket.off("pdf-received");
    };
  }, [socket]);

  // 🧠 Initial canvas size
  useEffect(() => {
    resizeCanvas();
  }, []);

  return (
    <div className="p-4">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "12px",
          padding: "10px",
          background: "#f0f0f0",
          borderRadius: "8px",
          marginBottom: "12px",
        }}
      >
        {/* 🎨 Color Picker */}
        <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "14px" }}>🎨</span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{
              appearance: "none",
              width: "28px",
              height: "28px",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          />
        </label>

        {/* ✏️ Pen Tool */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => setMode("pen")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              background: mode === "pen" ? "#2563eb" : "#e5e7eb",
              color: mode === "pen" ? "white" : "black",
              border: "none",
              cursor: "pointer",
            }}
          >
            ✏️ Pen
          </button>
          {mode === "pen" && (
            <input
              type="range"
              min="1"
              max="20"
              value={penSize}
              onChange={(e) => setPenSize(+e.target.value)}
              style={{ width: "80px" }}
            />
          )}
        </div>

        {/* 🖍️ Highlighter Tool */}
        <button
          onClick={() => setMode("highlighter")}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            background: mode === "highlighter" ? "#facc15" : "#e5e7eb",
            color: mode === "highlighter" ? "black" : "black",
            border: "none",
            cursor: "pointer",
          }}
        >
          🖍️ Highlight
        </button>

        {/* 🧽 Eraser Tool */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => setMode("eraser")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              background: mode === "eraser" ? "#ef4444" : "#e5e7eb",
              color: mode === "eraser" ? "white" : "black",
              border: "none",
              cursor: "pointer",
            }}
          >
            🧼 Eraser
          </button>
          {mode === "eraser" && (
            <input
              type="range"
              min="10"
              max="100"
              value={eraserSize}
              onChange={(e) => setEraserSize(+e.target.value)}
              style={{ width: "80px" }}
            />
          )}
          <button onClick={() => setMode("text")}>🔤 Text</button>
          <button onClick={() => setMode("rect")}>⬛ Rect</button>
          <button onClick={() => setMode("line")}>📏 Line</button>
          <button onClick={handleUndo} disabled={drawHistory.length === 0}>
            ↩️ Undo
          </button>
          <button onClick={handleRedo} disabled={redoStack.length === 0}>
            ↪️ Redo
          </button>
        </div>

        {/* Other Actions */}
        <button onClick={clearCanvas}>🧽 Clear</button>
        <button onClick={saveAsPNG}>🖼️ PNG</button>
        <button onClick={saveAsPDF}>📄 PDF</button>
        <input type="file" accept=".pdf" onChange={handlePDFUpload} />
      </div>

      <div
        ref={scrollRef}
        style={{
          width: "100%",
          height: "500px",
          overflowY: "scroll",
          position: "relative",
          border: "1px solid #ccc",
        }}
      >
        <div ref={pdfRef} />
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={stopDrawing}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 10,
            pointerEvents: "auto",
          }}
        />
      </div>

      <button
        onClick={expandCanvas}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        ➕ Expand Canvas
      </button>
    </div>
  );
};

export default Canvas;
