"use client";

import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  Square,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  SHAPE_DEFAULTS,
  SHAPE_DRAG_TYPE,
  type NodeShape,
  type ShapeDragPayload,
} from "@/types/canvas";

interface ShapeEntry {
  shape: NodeShape;
  Icon: LucideIcon;
  label: string;
}

const SHAPES: ShapeEntry[] = [
  { shape: "rectangle", Icon: Square,   label: "Rectangle" },
  { shape: "diamond",   Icon: Diamond,  label: "Diamond"   },
  { shape: "circle",    Icon: Circle,   label: "Circle"    },
  { shape: "pill",      Icon: Pill,     label: "Pill"      },
  { shape: "cylinder",  Icon: Cylinder, label: "Cylinder"  },
  { shape: "hexagon",   Icon: Hexagon,  label: "Hexagon"   },
];

function handleDragStart(
  event: React.DragEvent<HTMLButtonElement>,
  shape: NodeShape,
) {
  const { width, height } = SHAPE_DEFAULTS[shape];
  const payload: ShapeDragPayload = { shape, width, height };
  event.dataTransfer.setData(SHAPE_DRAG_TYPE, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = "copy";
}

export function ShapePanel() {
  return (
    <div className="mb-4 flex items-center gap-1 rounded-full border border-border bg-card px-3 py-2 shadow-lg">
      {SHAPES.map(({ shape, Icon, label }) => (
        <button
          key={shape}
          draggable
          onDragStart={(e) => handleDragStart(e, shape)}
          title={label}
          aria-label={`Drag ${label} onto canvas`}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
