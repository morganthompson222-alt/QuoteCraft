type Region = {
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  locale: string;
  postalLabel: string;
  postalPlaceholder: string;
};

export const REGIONS: Record<string, Region> = {
  UK: {
    code: "UK",
    name: "United Kingdom",
    currencyCode: "GBP",
    currencySymbol: "£",
    locale: "en-GB",
    postalLabel: "Postcode",
    postalPlaceholder: "SW1A 1AA",
  },
  US: {
    code: "US",
    name: "United States",
    currencyCode: "USD",
    currencySymbol: "$",
    locale: "en-US",
    postalLabel: "ZIP code",
    postalPlaceholder: "10001",
  },
  CA: {
    code: "CA",
    name: "Canada",
    currencyCode: "CAD",
    currencySymbol: "C$",
    locale: "en-CA",
    postalLabel: "Postal code",
    postalPlaceholder: "K1A 0B1",
  },
  AU: {
    code: "AU",
    name: "Australia",
    currencyCode: "AUD",
    currencySymbol: "A$",
    locale: "en-AU",
    postalLabel: "Postcode",
    postalPlaceholder: "2000",
  },
  EU: {
    code: "EU",
    name: "European Union",
    currencyCode: "EUR",
    currencySymbol: "€",
    locale: "en-IE",
    postalLabel: "Postcode",
    postalPlaceholder: "D02 X285",
  },
};

export const REGION_LIST = Object.values(REGIONS);

export function getRegion(regionCode: string): Region {
  const region = REGIONS[regionCode];
  if (!region) throw new Error(`Unknown region code: ${regionCode}`);
  return region;
}

export function formatCurrency(
  amount: number,
  regionCode: string,
): string {
  const region = getRegion(regionCode);
  try {
    return new Intl.NumberFormat(region.locale, {
      style: "currency",
      currency: region.currencyCode,
    }).format(amount);
  } catch {
    return `${region.currencySymbol}${amount.toFixed(2)}`;
  }
}

export function formatDate(
  date: Date | string,
  regionCode: string,
): string {
  const region = getRegion(regionCode);
  try {
    return new Intl.DateTimeFormat(region.locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  } catch {
    return new Date(date).toLocaleDateString(region.locale);
  }
}

export function validatePostalCode(
  value: string,
  regionCode: string,
): boolean {
  if (!value || value.trim().length === 0) return false;

  switch (regionCode) {
    case "UK":
      return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(value);
    case "US":
      return /^\d{5}(-\d{4})?$/.test(value);
    case "CA":
      return /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\s?\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(value);
    case "AU":
      return /^\d{4}$/.test(value);
    case "EU":
      return true;
    default:
      return value.length >= 3;
  }
}

export function getCurrencySymbol(regionCode: string): string {
  return getRegion(regionCode).currencySymbol;
}
