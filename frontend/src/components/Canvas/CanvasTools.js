import React from "react";

const CanvasTools = ({ onClear, onSave }) => {
  return (
    <div className="flex space-x-4 my-2">
      <button onClick={onClear}>Clear</button>
      <button onClick={onSave}>Save</button>
    </div>
  );
};

export default CanvasTools;
