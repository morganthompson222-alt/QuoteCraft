"use client";

import type { ReactNode } from "react";
import { RegionProvider } from "../hooks/useRegion";
import { ToastProvider } from "./Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <RegionProvider>
      <ToastProvider>{children}</ToastProvider>
    </RegionProvider>
  );
}
