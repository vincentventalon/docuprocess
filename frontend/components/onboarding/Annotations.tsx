import { ReactNode } from "react";

interface AnnotationProps {
  children: ReactNode;
}

// Hand-drawn style arrow pointing to a location
interface ArrowAnnotationProps {
  x: number;
  y: number;
  angle?: number; // degrees, 0 = pointing right
  label: string;
  labelPosition?: "top" | "bottom" | "left" | "right";
}

export function ArrowAnnotation({
  x,
  y,
  angle = -45,
  label,
  labelPosition = "top",
}: ArrowAnnotationProps) {
  const arrowLength = 60;
  const rad = (angle * Math.PI) / 180;

  // Arrow start point (offset from target)
  const startX = x - Math.cos(rad) * arrowLength;
  const startY = y - Math.sin(rad) * arrowLength;

  // Control point for curve (adds hand-drawn feel)
  const ctrlX = (startX + x) / 2 + (Math.random() - 0.5) * 10;
  const ctrlY = (startY + y) / 2 + (Math.random() - 0.5) * 10;

  // Arrowhead points
  const headLength = 12;
  const headAngle = 25 * (Math.PI / 180);
  const head1X = x - headLength * Math.cos(rad - headAngle);
  const head1Y = y - headLength * Math.sin(rad - headAngle);
  const head2X = x - headLength * Math.cos(rad + headAngle);
  const head2Y = y - headLength * Math.sin(rad + headAngle);

  // Label position
  const labelOffset = 8;
  let labelX = startX;
  let labelY = startY;
  let textAnchor = "middle";

  switch (labelPosition) {
    case "top":
      labelY = startY - labelOffset;
      break;
    case "bottom":
      labelY = startY + labelOffset + 14;
      break;
    case "left":
      labelX = startX - labelOffset;
      textAnchor = "end";
      break;
    case "right":
      labelX = startX + labelOffset;
      textAnchor = "start";
      break;
  }

  return (
    <g className="annotation-arrow">
      {/* Arrow line */}
      <path
        d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${x} ${y}`}
        fill="none"
        stroke="#f97316"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}
      />
      {/* Arrowhead */}
      <path
        d={`M ${head1X} ${head1Y} L ${x} ${y} L ${head2X} ${head2Y}`}
        fill="none"
        stroke="#f97316"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Label background */}
      <text
        x={labelX}
        y={labelY}
        textAnchor={textAnchor as "middle" | "start" | "end"}
        className="fill-white text-sm font-medium"
        style={{
          paintOrder: "stroke",
          stroke: "white",
          strokeWidth: 4,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
      >
        {label}
      </text>
      {/* Label text */}
      <text
        x={labelX}
        y={labelY}
        textAnchor={textAnchor as "middle" | "start" | "end"}
        className="fill-orange-500 text-sm font-medium"
      >
        {label}
      </text>
    </g>
  );
}

// Hand-drawn style circle highlight
interface CircleAnnotationProps {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export function CircleAnnotation({
  x,
  y,
  width,
  height,
  label,
}: CircleAnnotationProps) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width / 2 + 8;
  const ry = height / 2 + 8;

  // Create a slightly wobbly ellipse path for hand-drawn effect
  const points = 32;
  let path = "";
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const wobble = 1 + (Math.sin(angle * 3) * 0.03);
    const px = cx + rx * wobble * Math.cos(angle);
    const py = cy + ry * wobble * Math.sin(angle);
    path += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
  }
  path += " Z";

  return (
    <g className="annotation-circle">
      <path
        d={path}
        fill="none"
        stroke="#f97316"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="8 4"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}
      />
      {label && (
        <>
          <text
            x={cx}
            y={y - 20}
            textAnchor="middle"
            className="fill-white text-sm font-medium"
            style={{
              paintOrder: "stroke",
              stroke: "white",
              strokeWidth: 4,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          >
            {label}
          </text>
          <text
            x={cx}
            y={y - 20}
            textAnchor="middle"
            className="fill-orange-500 text-sm font-medium"
          >
            {label}
          </text>
        </>
      )}
    </g>
  );
}

// Container for annotations overlay
export function AnnotationsOverlay({ children }: AnnotationProps) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ overflow: "visible" }}
    >
      {children}
    </svg>
  );
}
