import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#E63946", // red
  "#F4A261", // orange
  "#2A9D8F", // teal
  "#457B9D", // steel blue
  "#A8DADC", // light cyan
  "#6A4C93", // purple
  "#F72585", // pink
  "#4CC9F0", // sky
  "#06D6A0", // mint
  "#FFB703", // amber
];

/** Deterministically maps a user ID string to a cursor color from the palette. */
export function getCursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}

declare const globalThis: {
  _liveblocksClient?: Liveblocks;
} & typeof global;

function createLiveblocksClient(): Liveblocks {
  return new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
  });
}

/** Returns the cached Liveblocks node client (lazy, so the secret is read at request time). */
export function getLiveblocks(): Liveblocks {
  if (process.env.NODE_ENV === "production") {
    return createLiveblocksClient();
  }
  return (globalThis._liveblocksClient ??= createLiveblocksClient());
}
