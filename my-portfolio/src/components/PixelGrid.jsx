import React, { useEffect, useState } from "react";

const PixelGrid = () => {
  const [pixels, setPixels] = useState([]);
  const gridSize = 20;
  const spacing = 2;

  useEffect(() => {
    const cols = Math.floor(window.innerWidth / (gridSize + spacing));
    const rows = Math.floor(window.innerHeight / (gridSize + spacing));
    const total = cols * rows;
    setPixels(Array.from({ length: total }));

    // Store cols in state to apply to the style below
    setGridCols(cols);
  }, []);

  const [gridCols, setGridCols] = useState(0);

  return (
    <div
      className="pixel-grid"
      style={{
        '--cols': gridCols,
      }}
    >
      {pixels.map((_, index) => (
        <div
          key={index}
          className="pixel-tile"
          style={{
            width: `${gridSize}px`,
            height: `${gridSize}px`,
          }}
        />
      ))}
    </div>
  );
};

export default PixelGrid;
