import React, { useEffect, useState } from 'react';

interface WinLineOverlayProps {
  winningLine: number[];
  winnerSymbol: 'X' | 'O';
  boardSize: number; // px width/height of the board container
}

/**
 * WinLineOverlay
 * Apple-style Liquid Glass victory strike line that animates across the 3 winning cells.
 * Placed absolutely over the tactical game board grid.
 */
export const WinLineOverlay: React.FC<WinLineOverlayProps> = ({ winningLine, winnerSymbol, boardSize }) => {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    // Trigger draw animation after mount
    const timer = setTimeout(() => setDrawn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!winningLine || winningLine.length !== 3) return null;

  // Cell centers in a 3x3 grid with gap
  const gap = 10;
  const cellSize = (boardSize - gap * 2) / 3;

  const getCellCenter = (idx: number): { x: number; y: number } => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    return {
      x: col * (cellSize + gap) + cellSize / 2,
      y: row * (cellSize + gap) + cellSize / 2,
    };
  };

  const sorted = [...winningLine].sort((a, b) => a - b);
  const start = getCellCenter(sorted[0]);
  const end = getCellCenter(sorted[2]);

  // Extend line slightly beyond cell centers for smooth appearance
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const extend = cellSize * 0.28;
  const normX = dx / len;
  const normY = dy / len;

  const x1 = start.x - normX * extend;
  const y1 = start.y - normY * extend;
  const x2 = end.x + normX * extend;
  const y2 = end.y + normY * extend;

  const totalLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  const isX = winnerSymbol === 'X';
  const strokeColor = isX ? '#0284C7' : '#E11D48';
  const glowColor = isX ? 'rgba(2, 132, 199, 0.4)' : 'rgba(225, 29, 72, 0.4)';

  return (
    <svg
      className="absolute inset-0 z-10 pointer-events-none"
      width={boardSize}
      height={boardSize}
      viewBox={`0 0 ${boardSize} ${boardSize}`}
    >
      <defs>
        <filter id="winGlassGlow">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient glass shadow line */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={glowColor}
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.6"
        strokeDasharray={totalLen}
        strokeDashoffset={drawn ? 0 : totalLen}
        style={{
          transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Main translucent glass line */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinecap="round"
        filter="url(#winGlassGlow)"
        strokeDasharray={totalLen}
        strokeDashoffset={drawn ? 0 : totalLen}
        style={{
          transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Glossy specular white core line */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.9"
        strokeDasharray={totalLen}
        strokeDashoffset={drawn ? 0 : totalLen}
        style={{
          transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.05s',
        }}
      />
    </svg>
  );
};
export default WinLineOverlay;
