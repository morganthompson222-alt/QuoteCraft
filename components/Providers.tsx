"use client";

import type { ReactNode } from "react";
import { RegionProvider } from "../hooks/useRegion";
import { ThemeProvider } from "../hooks/useTheme";
import { ToastProvider } from "./Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <RegionProvider>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </RegionProvider>
  );
}
