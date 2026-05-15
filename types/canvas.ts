import type { Edge, Node } from "@xyflow/react";

export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export type NodeShape = (typeof NODE_SHAPES)[number];

export const SHAPE_DEFAULTS: Record<NodeShape, { width: number; height: number }> = {
  rectangle: { width: 180, height: 80 },
  diamond:   { width: 160, height: 160 },
  circle:    { width: 100, height: 100 },
  pill:      { width: 180, height: 60 },
  cylinder:  { width: 120, height: 80 },
  hexagon:   { width: 140, height: 140 },
};

export const SHAPE_DRAG_TYPE = "application/ghost-shape";

export const NODE_COLORS = [
  { fill: "#1F1F1F", text: "#EDEDED" },
  { fill: "#10233D", text: "#52A8FF" },
  { fill: "#2E1938", text: "#BF7AF0" },
  { fill: "#331B00", text: "#FF990A" },
  { fill: "#3C1618", text: "#FF6166" },
  { fill: "#3A1726", text: "#F75F8F" },
  { fill: "#0F2E18", text: "#62C073" },
  { fill: "#062822", text: "#0AC7B4" },
] as const;

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color?: string;
  shape?: NodeShape;
}

export interface ShapeDragPayload {
  shape: NodeShape;
  width: number;
  height: number;
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;
export type CanvasEdge = Edge<Record<string, unknown>, "canvasEdge">;
