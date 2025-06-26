import React, { useRef, useEffect, useState } from "react";

const OverlayCanvas = ({ width, height }) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState("#000000");

  const handleMouseDown = (e) => {
    setDrawing(true);
    setLastPos(getCoords(e));
  };

  const handleMouseUp = () => setDrawing(false);

  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getCoords(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    setLastPos({ x, y });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
  }, [width, height]);

  return (
    <div style={{ position: "absolute", top: 0, left: 0 }}>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        style={{ position: "absolute", zIndex: 2 }}
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 2, // 🟢 must be higher than PDF viewer
          pointerEvents: "auto",
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
};

export default OverlayCanvas;
