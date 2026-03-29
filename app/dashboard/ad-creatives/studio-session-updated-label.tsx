"use client";

import { useEffect, useState } from "react";

export function StudioSessionUpdatedLabel({ updatedAt }: { updatedAt: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(
      new Date(updatedAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    );
  }, [updatedAt]);

  return <span>{label || "\u00a0"}</span>;
}
