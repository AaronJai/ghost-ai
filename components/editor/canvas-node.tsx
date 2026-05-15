"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import { NODE_COLORS, type CanvasNode } from "@/types/canvas";

const DEFAULT_COLOR = NODE_COLORS[0];

export function CanvasNodeComponent({ data, selected }: NodeProps<CanvasNode>) {
  const fill = data.color ?? DEFAULT_COLOR.fill;
  const textColor =
    NODE_COLORS.find((c) => c.fill === fill)?.text ?? DEFAULT_COLOR.text;

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium ${
        selected ? "border-primary" : "border-border"
      }`}
      style={{ background: fill, color: textColor }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <span className="truncate">{data.label}</span>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
