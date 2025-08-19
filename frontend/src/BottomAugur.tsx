"use client";

import React from "react";

type BottomAugurProps = {
  message?: string;
  className?: string;
};

/**
 * Reusable bottom-centered message component.
 * - Defaults to: "You are the Augur, step outside to take the auspices"
 * - Positioned fixed at the bottom, centered horizontally.
 * - Uses Tailwind utility classes; responsive sizes applied.
 * - pointer-events-none on the container so it doesn't block underlying interactions,
 *   pointer-events-auto on the inner box so the text itself can still be selectable if needed.
 */
export default function BottomAugur({
  message = "You are the Augur, step outside to take the auspices",
  className = "",
}: BottomAugurProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 w-full flex justify-center items-end pointer-events-none z-50 ${className}`}
      aria-hidden="false"
    >
      <div className="pointer-events-auto w-full bg-black py-4">
        <p className="font-roman text-white text-center text-2xl md:text-4xl lg:text-5xl tracking-wide drop-shadow-lg">
          {message}
        </p>
      </div>
    </div>
  );
}
