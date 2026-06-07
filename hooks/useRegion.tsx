"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type RegionContextValue = {
  regionCode: string;
  currencyCode: string;
  locale: string;
  formatCurrency: (amount: number) => string;
  formatDate: (value: Date | string) => string;
  postalLabel: string;
} | null;

const RegionContext = createContext<RegionContextValue>(null);

const FALLBACK = "US";

type RegionData = {
  region_code?: string;
  currency_code?: string;
  locale?: string;
};

const regionMeta: Record<string, { currencyCode: string; locale: string; postalLabel: string }> = {
  UK: { currencyCode: "GBP", locale: "en-GB", postalLabel: "Postcode" },
  US: { currencyCode: "USD", locale: "en-US", postalLabel: "ZIP code" },
  CA: { currencyCode: "CAD", locale: "en-CA", postalLabel: "Postal code" },
  AU: { currencyCode: "AUD", locale: "en-AU", postalLabel: "Postcode" },
  EU: { currencyCode: "EUR", locale: "en-IE", postalLabel: "Postcode" },
};

function buildFormatter(regionCode: string) {
  const meta = regionMeta[regionCode] ?? regionMeta[FALLBACK];

  return {
    formatCurrency: (amount: number): string => {
      try {
        return new Intl.NumberFormat(meta.locale, {
          style: "currency",
          currency: meta.currencyCode,
        }).format(amount);
      } catch {
        const symbols: Record<string, string> = { GBP: "£", USD: "$", CAD: "C$", AUD: "A$", EUR: "€" };
        return `${symbols[meta.currencyCode] ?? meta.currencyCode}${amount.toFixed(2)}`;
      }
    },
    formatDate: (value: Date | string): string => {
      try {
        return new Intl.DateTimeFormat(meta.locale, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(value));
      } catch {
        return new Date(value).toLocaleDateString(meta.locale);
      }
    },
    postalLabel: meta.postalLabel,
  };
}

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [regionCode, setRegionCode] = useState<string>(FALLBACK);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRegion() {
      try {
        const stored = window.localStorage.getItem("quotecraft_region");
        if (stored && regionMeta[stored]) {
          if (!cancelled) setRegionCode(stored);
          return;
        }

        const token = window.localStorage.getItem("quotecraft_token");
        const res = await fetch("/api/profile", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = (await res.json()) as RegionData;
          const code = data.region_code ?? FALLBACK;
          if (!cancelled) {
            setRegionCode(code);
            window.localStorage.setItem("quotecraft_region", code);
          }
        }
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    loadRegion();
    return () => { cancelled = true; };
  }, []);

  const formatters = useMemo(() => buildFormatter(regionCode), [regionCode]);

  const setRegion = useCallback((code: string) => {
    if (regionMeta[code]) {
      setRegionCode(code);
      window.localStorage.setItem("quotecraft_region", code);
    }
  }, []);

  const value = useMemo<RegionContextValue>(
    () => ({
      regionCode,
      currencyCode: regionMeta[regionCode]?.currencyCode ?? "USD",
      locale: regionMeta[regionCode]?.locale ?? "en-US",
      ...formatters,
    }),
    [regionCode, formatters],
  );

  return (
    <RegionContext.Provider value={value}>
      {ready ? children : children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used within RegionProvider");
  return ctx;
}
